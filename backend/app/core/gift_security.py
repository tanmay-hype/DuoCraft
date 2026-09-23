import hashlib
import hmac
from uuid import UUID

from app.core.config import settings


def generate_gift_token(gift_id: UUID) -> str:
    if not settings.gift_token_secret:
        raise RuntimeError("GIFT_TOKEN_SECRET is not configured.")

    secret = settings.gift_token_secret.encode("utf-8")

    digest = hmac.new(
        secret,
        gift_id.bytes,
        hashlib.sha256,
    ).digest()

    return digest.hex()


def hash_gift_token(token: str) -> str:
    return hashlib.sha256(
        token.encode("utf-8"),
    ).hexdigest()


def gift_token_matches(
    token: str,
    expected_hash: str,
) -> bool:
    actual_hash = hash_gift_token(token)

    return hmac.compare_digest(
        actual_hash,
        expected_hash,
    )
