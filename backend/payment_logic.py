"""
Payment Logic Service
Determines how a session booking should be paid based on user status, 
university sponsorship, and platform configuration.
"""

import logging

from sqlalchemy.orm import Session

from models import PlatformConfig, SessionBooking, University, User

logger = logging.getLogger("mecac.payment")

def get_platform_config(db: Session, key: str, default_value: str = "") -> str:
    """Fetches a config value from PlatformConfig table."""
    config = db.query(PlatformConfig).filter(PlatformConfig.key == key).first()
    return config.value if config else default_value
def determine_payment_mode(
    db: Session, 
    user: User, 
    therapist: User, 
    university: University | None = None
) -> dict:
    """
    Decides the payment strategy for a booking.
    Priority: Free Quota > University Pool > Paid (if enabled) > Blocked.
    """
    
    # 1. Check User's Free Quota FIRST (Always allowed in Tasting Mode)
    if user.free_sessions_used < user.free_sessions_total:
        remaining = user.free_sessions_total - user.free_sessions_used
        logger.info(f"User {user.id} has {remaining} free sessions left.")
        return {
            "mode": "free_quota",
            "reason": f"Using free session quota ({remaining} remaining).",
            "cost": 0.0
        }

    # 2. Check University Sponsorship Pool SECOND (Always allowed in Tasting Mode)
    if university and university.sponsored_sessions_used < university.sponsored_sessions_pool:
        remaining_pool = university.sponsored_sessions_pool - university.sponsored_sessions_used
        logger.info(f"University {university.name} has {remaining_pool} sponsored slots left.")
        return {
            "mode": "university_pool",
            "reason": f"Sponsored by {university.name}.",
            "cost": 0.0
        }

    # 3. No free/sponsored options available. Must Pay.
    # Check Global Kill Switch (Tasting Mode)
    payments_enabled_str = get_platform_config(db, "payments_enabled", "false")
    payments_enabled = payments_enabled_str.lower() == "true"
    
    if not payments_enabled:
        logger.warning(f"Tasting Mode Active. Blocking paid booking for User {user.id}")
        return {
            "mode": "blocked",
            "reason": "System maintenance: Payments temporarily disabled.",
            "cost": 0.0
        }

    # 4. Payments Enabled. Calculate Standard Cost.
    base_rate = getattr(therapist, 'session_rate', 0) or 0
    
    # Apply student discount if applicable
    if university and hasattr(therapist, 'student_rate') and therapist.student_rate:
        cost = therapist.student_rate
    else:
        cost = base_rate

    logger.info(f"No free/sponsored options available. Charging ${cost} via FortPesa.")
    
    return {
        "mode": "paid",
        "reason": "Standard rate applies.",
        "cost": float(cost)
    }
def apply_payment_decision(db: Session, booking: SessionBooking, decision: dict):
    """
    Updates the booking record with the decided payment mode and adjusts counters.
    """
    booking.payment_mode = decision["mode"]
    
    # Adjust counters based on mode
    if decision["mode"] == "free_quota":
        # We assume 'booking.user_id' links to the User who booked
        user = db.query(User).filter(User.id == booking.user_id).first()
        if user:
            user.free_sessions_used += 1
            
    elif decision["mode"] == "university_pool":
        # Find university linked to the user or booking context
        # Simplified: Assume user has university_id
        user = db.query(User).filter(User.id == booking.user_id).first()
        if user and user.university_id:
            uni = db.query(University).filter(University.id == user.university_id).first()
            if uni:
                uni.sponsored_sessions_used += 1
                
    db.commit()
    logger.info(f"Booking {booking.id} finalized with mode: {decision['mode']}")