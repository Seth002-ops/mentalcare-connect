"""
Global Cache Invalidator
Listens to SQLAlchemy session commits and clears Redis caches 
when specific tables are modified by Admins.
"""

import logging

from sqlalchemy import event
from sqlalchemy.orm import Session

from cache_service import delete_cache

logger = logging.getLogger("mecac.cache_invalidator")

# Define which models trigger which cache keys
CACHE_TRIGGERS = {
    "University": ["mecac:cache:universities"],
    "RageRoom": ["mecac:cache:rage_rooms"],
    "RageRoomPackage": ["mecac:cache:rage_rooms"], # Packages affect rooms list
    "User": ["mecac:cache:therapists_list"],       # Only if user_type is therapist? We'll check below.
}

def invalidate_caches_on_commit(session):
    """
    Called after every successful db.commit().
    Checks dirty objects and deletes relevant Redis keys.
    """
    try:
        # Get all objects that were inserted, updated, or deleted in this transaction
        dirty_objects = session.dirty
        new_objects = session.new
        deleted_objects = session.deleted
        
        combined_changes = list(dirty_objects) + list(new_objects) + list(deleted_objects)
        
        if not combined_changes:
            return

        triggered_keys = set()

        for obj in combined_changes:
            model_name = type(obj).__name__
            
            # Check if this model has associated cache triggers
            if model_name in CACHE_TRIGGERS:
                keys_to_clear = CACHE_TRIGGERS[model_name]
                
                # Special Case: Only clear therapist cache if the user IS a therapist
                if model_name == "User":
                    if getattr(obj, 'user_type', None) == 'therapist':
                        triggered_keys.update(keys_to_clear)
                    else:
                        continue # Ignore clients/admins for this specific cache
                
                else:
                    triggered_keys.update(keys_to_clear)

        # Execute deletion
        for key in triggered_keys:
            delete_cache(key)
            logger.info(f"🧹 Auto-invalidated cache: {key}")

    except Exception as e:
        # Never let cache invalidation crash the main app
        logger.error(f"Cache invalidation error: {e}")


def register_cache_events():
    """
    Call this once at app startup to bind the listener to the Session class.
    """
    @event.listens_for(Session, "after_commit")
    def receive_after_commit(target, connection, **kw):
        invalidate_caches_on_commit(target)

    logger.info("✅ Global Cache Invalidator registered.")