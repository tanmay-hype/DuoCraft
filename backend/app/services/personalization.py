from typing import Any

from pydantic import ValidationError

from app.schemas.personalization import (
    BirthdayPersonalization,
    PhotoPuzzlePersonalization,
    ThankYouPersonalization,
)

BIRTHDAY_THEMES = {
    "warm-confetti",
    "rose-celebration",
    "midnight-gold",
}

THANK_YOU_THEMES = {
    "pressed-flowers",
    "warm-paper",
    "garden-note",
}

PHOTO_PUZZLE_THEMES = {
    "classic-pieces",
    "romantic-pieces",
    "playful-pieces",
}

DEFAULT_BIRTHDAY_THEME = "warm-confetti"
DEFAULT_THANK_YOU_THEME = "pressed-flowers"
DEFAULT_PHOTO_PUZZLE_THEME = "classic-pieces"


class PersonalizationValidationError(ValueError):
    pass


def validate_personalization(
    template_key: str,
    personalization: dict[str, Any],
) -> dict[str, Any]:
    try:
        if template_key == "birthday":
            validated = BirthdayPersonalization.model_validate(
                personalization,
            )
            return validated.model_dump()

        if template_key == "thank_you":
            validated = ThankYouPersonalization.model_validate(
                personalization,
            )
            return validated.model_dump()

        if template_key == "photo_puzzle":
            validated = PhotoPuzzlePersonalization.model_validate(
                personalization,
            )
            return validated.model_dump()

    except ValidationError as exc:
        raise PersonalizationValidationError(
            "Invalid personalization data.",
        ) from exc

    raise PersonalizationValidationError(
        f"Unsupported template: {template_key}.",
    )


def validate_theme(
    template_key: str,
    theme_key: str | None,
) -> str | None:
    if template_key == "birthday":
        if theme_key is None:
            return DEFAULT_BIRTHDAY_THEME

        if theme_key not in BIRTHDAY_THEMES:
            raise PersonalizationValidationError(
                "Invalid birthday theme.",
            )

        return theme_key

    if template_key == "thank_you":
        if theme_key is None:
            return DEFAULT_THANK_YOU_THEME

        if theme_key not in THANK_YOU_THEMES:
            raise PersonalizationValidationError(
                "Invalid thank-you theme.",
            )

        return theme_key

    if template_key == "photo_puzzle":
        if theme_key is None:
            return DEFAULT_PHOTO_PUZZLE_THEME

        if theme_key not in PHOTO_PUZZLE_THEMES:
            raise PersonalizationValidationError(
                "Invalid photo puzzle theme.",
            )

        return theme_key

    raise PersonalizationValidationError(
        f"Unsupported template: {template_key}.",
    )
