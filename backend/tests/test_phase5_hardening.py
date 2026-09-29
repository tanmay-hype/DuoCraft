from datetime import UTC, datetime, timedelta
from types import SimpleNamespace
from uuid import uuid4

import pytest
from fastapi import HTTPException
from redis.exceptions import RedisError

from app.core import rate_limit
from app.core.config import settings
from app.models import Draft, Gift
from app.schemas import DraftUpdate
from app.services.draft import DraftService
from app.services.gift import GiftService


class FakeRedis:
    def __init__(self) -> None:
        self.counts: dict[str, int] = {}
        self.expirations: dict[str, int] = {}

    def incr(self, key: str) -> int:
        self.counts[key] = self.counts.get(key, 0) + 1
        return self.counts[key]

    def expire(self, key: str, seconds: int) -> bool:
        self.expirations[key] = seconds
        return True


class FailingRedis:
    def incr(self, key: str) -> int:
        raise RedisError("Redis unavailable")


class EmptyPhotoQuery:
    def filter(self, *args: object) -> "EmptyPhotoQuery":
        return self

    def one_or_none(self) -> None:
        return None


class PhotoLookupSession:
    def __init__(self) -> None:
        self.committed = False

    def query(self, model: object) -> EmptyPhotoQuery:
        return EmptyPhotoQuery()

    def commit(self) -> None:
        self.committed = True

    def refresh(self, instance: object) -> None:
        return None


def test_public_gift_rate_limit_sets_window_and_rejects_excess_requests(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    redis_client = FakeRedis()
    monkeypatch.setattr(rate_limit, "get_redis_client", lambda: redis_client)

    original_limit = settings.public_gift_rate_limit
    original_window = settings.public_gift_rate_window_seconds

    try:
        settings.public_gift_rate_limit = 2
        settings.public_gift_rate_window_seconds = 45
        request = SimpleNamespace(
            client=SimpleNamespace(host="203.0.113.10"),
        )

        rate_limit.enforce_public_gift_rate_limit(request)
        rate_limit.enforce_public_gift_rate_limit(request)

        with pytest.raises(HTTPException) as raised:
            rate_limit.enforce_public_gift_rate_limit(request)

        assert raised.value.status_code == 429
        assert raised.value.headers["Retry-After"] == "45"
        assert redis_client.expirations[
            "duocraft:rate-limit:public-gift:203.0.113.10"
        ] == 45
    finally:
        settings.public_gift_rate_limit = original_limit
        settings.public_gift_rate_window_seconds = original_window


def test_public_gift_rate_limit_fails_open_when_redis_is_unavailable(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(
        rate_limit,
        "get_redis_client",
        lambda: FailingRedis(),
    )

    request = SimpleNamespace(
        client=SimpleNamespace(host="203.0.113.11"),
    )

    rate_limit.enforce_public_gift_rate_limit(request)


def test_photo_puzzle_rejects_unavailable_selected_photo() -> None:
    session = PhotoLookupSession()
    draft = Draft(
        id=uuid4(),
        template_key="photo_puzzle",
        personalization={},
        expires_at=datetime.now(UTC) + timedelta(days=1),
    )
    data = DraftUpdate(
        personalization={
            "recipient_name": "Alex",
            "sender_name": "Sam",
            "message": "A memory",
            "photo_asset_id": str(uuid4()),
        },
    )

    with pytest.raises(ValueError, match="selected photo"):
        DraftService(session).update_draft(draft, data)

    assert session.committed is False


def test_gift_expiry_uses_utc_boundary() -> None:
    expired = Gift(
        expires_at=datetime.now(UTC) - timedelta(seconds=1),
    )
    active = Gift(
        expires_at=datetime.now(UTC) + timedelta(days=1),
    )

    assert GiftService._is_expired(expired) is True
    assert GiftService._is_expired(active) is False