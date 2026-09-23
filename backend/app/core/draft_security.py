import hashlib
import secrets


def generate_owner_token() -> str:
    return secrets.token_urlsafe(32)


def hash_owner_token(token: str) -> str:
    return hashlib.sha256(
        token.encode("utf-8"),
    ).hexdigest()


def owner_token_matches(
    token: str,
    expected_hash: str,
) -> bool:
    actual_hash = hash_owner_token(token)

    return secrets.compare_digest(
        actual_hash,
        expected_hash,
    )
