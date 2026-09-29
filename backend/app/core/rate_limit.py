from functools import lru_cache

from fastapi import HTTPException, Request, status
from redis import Redis
from redis.exceptions import RedisError

from app.core.config import settings


@lru_cache
def get_redis_client() -> Redis:
    return Redis.from_url(
        settings.redis_url,
        decode_responses=True,
    )


def enforce_public_gift_rate_limit(request: Request) -> None:
    client_host = request.client.host if request.client else "unknown"
    key = f"duocraft:rate-limit:public-gift:{client_host}"

    try:
        redis_client = get_redis_client()
        request_count = redis_client.incr(key)

        if request_count == 1:
            redis_client.expire(
                key,
                settings.public_gift_rate_window_seconds,
            )
    except RedisError:
        # A rate-limit backend outage must not make already-created gifts unavailable.
        return

    if request_count > settings.public_gift_rate_limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many gift requests. Please try again shortly.",
            headers={
                "Retry-After": str(
                    settings.public_gift_rate_window_seconds,
                ),
            },
        )