"""
Redis client for security features (IP blocking, rate limiting, cache).
Uses REDIS_URL from the environment if present. Falls back to localhost:6379.
When Redis is unreachable, redis_client is None and features degrade gracefully.
"""

import logging
import os

from dotenv import load_dotenv

try:
    import redis
except ImportError:
    redis = None

logger = logging.getLogger("mecac.redis")

load_dotenv()

# Default to local Redis if no env var is set
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

redis_client = None

if redis is not None:
    try:
        redis_client = redis.Redis.from_url(
            REDIS_URL,
            decode_responses=True,
            socket_connect_timeout=2,
            socket_timeout=2,
        )
        redis_client.ping()
        logger.info("Connected to Redis at %s", REDIS_URL)
    except Exception as exc:
        logger.warning("Redis unavailable (%s). Security/Cache will run without Redis.", exc)
        redis_client = None
else:
    logger.warning("Python 'redis' package not installed. Cache/Security disabled.")


def is_redis_available() -> bool:
    """Check if Redis connection is active."""
    if redis_client is None:
        return False
    try:
        redis_client.ping()
        return True
    except Exception:
        return False