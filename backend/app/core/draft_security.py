import hashlib
import secrets


def generate_owner_token() -> str:
    """Generate a cryptographically secure token for anonymous draft ownership."""
    return secrets.token_urlsafe(32)


def hash_owner_token(token: str) -> str:
    """Return the SHA-256 hash stored for a draft owner token."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def owner_token_matches(
    token: str,
    expected_hash: str,
) -> bool:
    """Verify a raw owner token using a constant-time comparison."""
    actual_hash = hash_owner_token(token)

    return secrets.compare_digest(
        actual_hash,
        expected_hash,
    )
