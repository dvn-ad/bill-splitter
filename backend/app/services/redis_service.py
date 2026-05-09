import redis as _redis
from app.core.config import get_settings

_client: _redis.Redis | None = None


def get_redis() -> _redis.Redis:
    global _client
    if _client is None:
        _client = _redis.from_url(get_settings().REDIS_URL, decode_responses=True)
    return _client


def blacklist_token(jti: str, ttl_seconds: int) -> None:
    get_redis().setex(f"bl:{jti}", ttl_seconds, "1")


def is_blacklisted(jti: str) -> bool:
    return get_redis().exists(f"bl:{jti}") == 1
