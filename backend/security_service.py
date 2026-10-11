import json
import logging
import time
from typing import Any

from fastapi import Request

from redis_client import redis_client

try:
    from models import SecurityEvent
except Exception:
    SecurityEvent = None

logger = logging.getLogger("mecac.security")

BLOCKED_IPS_KEY = "mecac:security:blocked_ips"
TEMP_BLOCK_PREFIX = "mecac:security:temp_block:"
RATE_PREFIX = "mecac:security:rate:"
LOGIN_FAIL_PREFIX = "mecac:security:login_fail:"

RATE_RULES = {
    "global": {"limit": 180, "window": 60},
    "/auth/login": {"limit": 5, "window": 60},
    "/auth/register": {"limit": 3, "window": 60},
    "/auth/student-signup": {"limit": 3, "window": 60},
    "/payments/simulate": {"limit": 5, "window": 60},
    "/ai/chat": {"limit": 15, "window": 60},
}


def redis_ready() -> bool:
    try:
        if redis_client is None:
            return False
        redis_client.ping()
        return True
    except Exception as exc:
        logger.debug("Redis ping failed: %s", exc)
        return False


def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    real_ip = request.headers.get("x-real-ip")
    if real_ip:
        return real_ip.strip()
    if request.client and request.client.host:
        return request.client.host
    return "unknown"


def get_user_agent(request: Request) -> str:
    return request.headers.get("user-agent", "")[:500]


def temp_block_key(ip: str) -> str:
    return f"{TEMP_BLOCK_PREFIX}{ip}"


def is_ip_blocked(ip: str) -> bool:
    if not redis_ready():
        return False
    try:
        if redis_client.sismember(BLOCKED_IPS_KEY, ip):
            return True
        return bool(redis_client.exists(temp_block_key(ip)))
    except Exception as exc:
        logger.warning("Failed checking IP block status: %s", exc)
        return False


def block_ip(
    ip: str,
    reason: str = "",
    duration_seconds: int | None = None,
    permanent: bool = True,
) -> bool:
    if not redis_ready():
        return False
    try:
        if permanent:
            redis_client.sadd(BLOCKED_IPS_KEY, ip)
        if duration_seconds and duration_seconds > 0:
            redis_client.setex(
                temp_block_key(ip), duration_seconds, reason or "blocked"
            )
        return True
    except Exception as exc:
        logger.warning("Failed to block IP %s: %s", ip, exc)
        return False


def unblock_ip(ip: str) -> bool:
    if not redis_ready():
        return False
    try:
        redis_client.srem(BLOCKED_IPS_KEY, ip)
        redis_client.delete(temp_block_key(ip))
        return True
    except Exception as exc:
        logger.warning("Failed to unblock IP %s: %s", ip, exc)
        return False


def get_blocked_ips() -> list[str]:
    if not redis_ready():
        return []
    try:
        permanent = redis_client.smembers(BLOCKED_IPS_KEY) or set()
        temporary = []
        for key in redis_client.scan_iter(match=f"{TEMP_BLOCK_PREFIX}*"):
            ip = key.replace(TEMP_BLOCK_PREFIX, "")
            temporary.append(ip)
        return sorted(set(list(permanent) + temporary))
    except Exception as exc:
        logger.warning("Failed to list blocked IPs: %s", exc)
        return []


def get_rate_rule(path: str) -> dict[str, int]:
    return RATE_RULES.get(path, RATE_RULES["global"])


def check_rate_limit(ip: str, path: str) -> dict[str, Any]:
    if not redis_ready():
        return {"allowed": True, "remaining": None, "limit": None}
    
    rule = get_rate_rule(path)
    scope = path if path in RATE_RULES else "global"
    window = rule["window"]
    limit = rule["limit"]
    bucket = int(time.time() // window)
    key = f"{RATE_PREFIX}{scope}:{ip}:{bucket}"
    
    try:
        current = redis_client.incr(key)
        if current == 1:
            redis_client.expire(key, window)
        allowed = current <= limit
        remaining = max(limit - current, 0)
        return {"allowed": allowed, "remaining": remaining, "limit": limit}
    except Exception as exc:
        logger.warning("Rate limit check failed for %s: %s", ip, exc)
        return {"allowed": True, "remaining": None, "limit": None}


def register_failed_login(
    ip: str, max_attempts: int = 5, window_seconds: int = 300
) -> int:
    if not redis_ready():
        return 0
    try:
        key = f"{LOGIN_FAIL_PREFIX}{ip}"
        attempts = redis_client.incr(key)
        if attempts == 1:
            redis_client.expire(key, window_seconds)
        if attempts >= max_attempts:
            block_ip(
                ip,
                reason="too_many_failed_logins",
                duration_seconds=window_seconds,
                permanent=False,
            )
        return attempts
    except Exception as exc:
        logger.warning("Failed login counter error for %s: %s", ip, exc)
        return 0


def clear_failed_logins(ip: str) -> None:
    if not redis_ready():
        return
    try:
        redis_client.delete(f"{LOGIN_FAIL_PREFIX}{ip}")
    except Exception as exc:
        logger.debug("Failed to clear login counters for %s: %s", ip, exc)


def record_security_event(
    db,
    *,
    ip_address: str,
    event_type: str,
    severity: str = "medium",
    method: str | None = None,
    path_hit: str | None = None,
    status_code: int | None = None,
    user_agent: str | None = None,
    user_id: int | None = None,
    details: dict[str, Any] | None = None,
    action_taken: str | None = None,
) -> None:
    if SecurityEvent is None or db is None:
        return
    try:
        event = SecurityEvent(
            ip_address=ip_address,
            user_agent=(user_agent or "")[:500],
            user_id=user_id,
            event_type=event_type,
            severity=severity,
            method=method,
            path_hit=path_hit,
            status_code=status_code,
            details=json.dumps(details or {}, default=str),
            action_taken=action_taken,
        )
        db.add(event)
        db.commit()
    except Exception as exc:
        try:
            db.rollback()
        except Exception as rb_exc:
            logger.debug("Rollback failed: %s", rb_exc)
        logger.warning("Failed to record security event: %s", exc)