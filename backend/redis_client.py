"""
Redis client for security features (IP blocking, rate limiting, cache).

Uses REDIS_URL from the environment if present. When Redis is not configured
or unreachable, redis_client is None and all security features degrade
gracefully (no blocking, no rate limiting via Redis, no cache).
"""

import logging
import os

from dotenv import load_dotenv

try:
    import redis  # type: ignore
except ImportError:
    redis = None  # type: ignore

logger = logging.getLogger("mecac.redis")

# Ensure .env is loaded even when this module is imported standalone
load_dotenv()

REDIS_URL = os.getenv("REDIS_URL", "")

redis_client = None

if redis is not None and REDIS_URL:
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
        logger.warning("Redis unavailable (%s). Security features will run without Redis.", exc)
        redis_client = None
elif not REDIS_URL:
    logger.info("REDIS_URL not set. Security features will run without Redis.")
