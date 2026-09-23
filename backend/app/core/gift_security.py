import hashlib
import secrets


def generate_gift_token() -> str:
    return secrets.token_urlsafe(32)


def hash_gift_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def gift_token_matches(
    token: str,
    expected_hash: str,
) -> bool:
    actual_hash = hash_gift_token(token)
    return secrets.compare_digest(
        actual_hash,
        expected_hash,
    )
