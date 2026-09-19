from typing import Any

from pydantic import ValidationError

from app.schemas.personalization import (
    BirthdayPersonalization,
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

DEFAULT_BIRTHDAY_THEME = "warm-confetti"
DEFAULT_THANK_YOU_THEME = "pressed-flowers"


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

    raise PersonalizationValidationError(
        f"Unsupported template: {template_key}.",
    )
