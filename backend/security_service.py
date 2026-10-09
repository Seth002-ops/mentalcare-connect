"""
Security service: IP blocking and security event recording.

Backed by Redis when available; falls back gracefully when Redis is
unavailable (blocks are not persisted in that case, but the app keeps
working and events are still recorded in the database).
"""

import json
import logging
from datetime import datetime

from redis_client import redis_client

logger = logging.getLogger("mecac.security")

BLOCKED_IP_PREFIX = "mecac:security:blocked_ip:"

try:
    from models import SecurityEvent
except ImportError:
    SecurityEvent = None


def redis_ready() -> bool:
    try:
        if redis_client is None:
            return False
        redis_client.ping()
        return True
    except Exception:
        return False


def record_security_event(
    db,
    *,
    event_type: str,
    severity: str,
    method: str | None = None,
    path_hit: str | None = None,
    status_code: int | None = None,
    ip_address: str | None = None,
    user_agent: str | None = None,
    user_id: int | None = None,
    details: dict | None = None,
    action_taken: str | None = None,
):
    """
    Record a security event in the database. Fails silently so that a
    database issue never breaks the caller (e.g. a middleware).
    """
    if SecurityEvent is None:
        logger.warning("SecurityEvent model not available; event not recorded: %s", event_type)
        return None

    try:
        event = SecurityEvent(
            event_type=event_type,
            severity=severity,
            method=method,
            path_hit=path_hit,
            status_code=status_code,
            ip_address=ip_address,
            user_agent=user_agent,
            user_id=user_id,
            details=json.dumps(details or {}, default=str),
            action_taken=action_taken,
        )
        db.add(event)
        db.commit()
        return event

    except Exception as exc:
        try:
            db.rollback()
        except Exception as rollback_exc:
            logger.debug("Rollback after failed event insert also failed: %s", rollback_exc)
        logger.warning("Failed to record security event %s: %s", event_type, exc)
        return None


def block_ip(
    ip: str,
    *,
    reason: str = "",
    duration_seconds: int | None = None,
    permanent: bool = True,
) -> bool:
    """
    Block an IP. Returns True when the block was stored, False when Redis
    is unavailable. Permanent = True means permanent; otherwise it expires
    after duration_seconds (default 1 hour).
    """
    if not redis_ready():
        logger.warning("Cannot block IP %s: Redis unavailable", ip)
        return False

    try:
        payload = json.dumps(
            {
                "reason": reason,
                "permanent": permanent,
                "blocked_at": datetime.utcnow().isoformat(),
            },
            default=str,
        )

        if permanent:
            redis_client.set(f"{BLOCKED_IP_PREFIX}{ip}", payload)
        else:
            ttl = duration_seconds if duration_seconds and duration_seconds > 0 else 3600
            redis_client.setex(f"{BLOCKED_IP_PREFIX}{ip}", ttl, payload)

        return True

    except Exception as exc:
        logger.warning("block_ip failed for %s: %s", ip, exc)
        return False


def unblock_ip(ip: str) -> bool:
    if not redis_ready():
        logger.warning("Cannot unblock IP %s: Redis unavailable", ip)
        return False

    try:
        deleted = redis_client.delete(f"{BLOCKED_IP_PREFIX}{ip}")
        return deleted is not None and deleted > 0

    except Exception as exc:
        logger.warning("unblock_ip failed for %s: %s", ip, exc)
        return False


def is_ip_blocked(ip: str) -> bool:
    """
    Check whether an IP is currently blocked. Requires Redis; when Redis is
    down no blocking is enforced (fail-open, so the app stays reachable).
    """
    if not redis_ready():
        return False

    try:
        return redis_client.exists(f"{BLOCKED_IP_PREFIX}{ip}") > 0

    except Exception as exc:
        logger.warning("is_ip_blocked failed for %s: %s", ip, exc)
        return False


RATE_LIMIT_PREFIX = "mecac:security:rate:"

DEFAULT_RATE_LIMITS = (
    ("/auth/", 10, 60),  # 10 requests per 60s for auth endpoints
)

FALLBACK_RATE_LIMIT = (60, 60)  # 60 requests per minute elsewhere


def check_rate_limit(ip: str, path: str) -> dict:
    """
    Sliding-window rate limit backed by Redis.

    Returns {"allowed": bool, "limit": int, "window": int}. When Redis is
    unavailable the request is always allowed (fail-open).
    """
    if not redis_ready():
        return {"allowed": True, "limit": None, "window": None}

    limit, window = FALLBACK_RATE_LIMIT
    for prefix, prefix_limit, prefix_window in DEFAULT_RATE_LIMITS:
        if path.startswith(prefix):
            limit, window = prefix_limit, prefix_window
            break

    key = f"{RATE_LIMIT_PREFIX}{ip}:{path}"

    try:
        count = redis_client.incr(key)
        if count == 1:
            redis_client.expire(key, window)

        ttl = redis_client.ttl(key)
        if ttl is not None and ttl < 0:
            redis_client.expire(key, window)

        return {
            "allowed": count <= limit,
            "limit": limit,
            "window": window,
        }

    except Exception as exc:
        logger.warning("check_rate_limit failed for %s: %s", ip, exc)
        return {"allowed": True, "limit": limit, "window": window}


def get_blocked_ips() -> list:
    if not redis_ready():
        return []

    blocked = []

    try:
        for key in redis_client.scan_iter(match=f"{BLOCKED_IP_PREFIX}*"):
            blocked.append(key.replace(BLOCKED_IP_PREFIX, ""))

        return sorted(blocked)

    except Exception as exc:
        logger.warning("get_blocked_ips failed: %s", exc)
        return []
