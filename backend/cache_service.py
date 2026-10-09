import json
import logging
from typing import Any

from redis_client import redis_client

logger = logging.getLogger("mecac.cache")

CACHE_PREFIX = "mecac:cache:"


def redis_ready() -> bool:
    try:
        if redis_client is None:
            return False

        redis_client.ping()
        return True

    except Exception:
        return False


def cache_key(key: str) -> str:
    return f"{CACHE_PREFIX}{key}"


def get_cache(key: str, default: Any | None = None) -> Any:
    """
    Get a value from Redis cache.
    Returns default if cache is unavailable or key does not exist.
    """
    if not redis_ready():
        return default

    try:
        raw = redis_client.get(cache_key(key))

        if raw is None:
            return default

        return json.loads(raw)

    except Exception as exc:
        logger.warning("Cache get failed for %s: %s", key, exc)
        return default


def set_cache(key: str, value: Any, ttl: int = 60) -> bool:
    """
    Store a value in Redis cache.

    ttl is in seconds.
    """
    if not redis_ready():
        return False

    try:
        redis_client.setex(
            cache_key(key),
            ttl,
            json.dumps(value, default=str),
        )
        return True

    except Exception as exc:
        logger.warning("Cache set failed for %s: %s", key, exc)
        return False


def delete_cache(key: str) -> bool:
    if not redis_ready():
        return False

    try:
        redis_client.delete(cache_key(key))
        return True

    except Exception as exc:
        logger.warning("Cache delete failed for %s: %s", key, exc)
        return False


def delete_all_cache() -> int:
    """
    Delete all Mecac cache keys.
    Does not delete security keys.
    """
    if not redis_ready():
        return 0

    deleted = 0

    try:
        for key in redis_client.scan_iter(match=f"{CACHE_PREFIX}*"):
            redis_client.delete(key)
            deleted += 1

        return deleted

    except Exception as exc:
        logger.warning("Cache clear failed: %s", exc)
        return 0


def get_cache_info() -> dict:
    if not redis_ready():
        return {
            "available": False,
            "cache_keys": 0,
        }

    try:
        count = 0

        for _ in redis_client.scan_iter(match=f"{CACHE_PREFIX}*"):
            count += 1

        return {
            "available": True,
            "cache_keys": count,
        }

    except Exception as exc:
        logger.warning("Cache info failed: %s", exc)
        return {
            "available": False,
            "cache_keys": 0,
        }