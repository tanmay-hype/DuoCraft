from uuid import uuid4

from app.core.config import settings
from app.core.gift_security import (
    generate_gift_token,
    gift_token_matches,
    hash_gift_token,
)


def test_gift_token_is_deterministic_for_same_gift() -> None:
    original_secret = settings.gift_token_secret

    try:
        settings.gift_token_secret = "test-gift-secret"

        gift_id = uuid4()

        first_token = generate_gift_token(gift_id)
        second_token = generate_gift_token(gift_id)

        assert first_token == second_token
        assert len(first_token) == 64

    finally:
        settings.gift_token_secret = original_secret


def test_different_gifts_have_different_tokens() -> None:
    original_secret = settings.gift_token_secret

    try:
        settings.gift_token_secret = "test-gift-secret"

        first_token = generate_gift_token(uuid4())
        second_token = generate_gift_token(uuid4())

        assert first_token != second_token

    finally:
        settings.gift_token_secret = original_secret


def test_gift_token_hash_matches() -> None:
    original_secret = settings.gift_token_secret

    try:
        settings.gift_token_secret = "test-gift-secret"

        token = generate_gift_token(uuid4())
        token_hash = hash_gift_token(token)

        assert gift_token_matches(
            token,
            token_hash,
        )

    finally:
        settings.gift_token_secret = original_secret


def test_wrong_token_does_not_match() -> None:
    original_secret = settings.gift_token_secret

    try:
        settings.gift_token_secret = "test-gift-secret"

        token = generate_gift_token(uuid4())
        wrong_token = generate_gift_token(uuid4())
        token_hash = hash_gift_token(token)

        assert not gift_token_matches(
            wrong_token,
            token_hash,
        )

    finally:
        settings.gift_token_secret = original_secret
