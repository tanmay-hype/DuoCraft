from typing import Any

from pydantic import ValidationError

from app.schemas.personalization import (
    AnniversaryPersonalization,
    ApologyPersonalization,
    BirthdayPersonalization,
    FriendshipPersonalization,
    LoveLetterPersonalization,
    MothersDayPersonalization,
    PhotoPuzzlePersonalization,
    ProposalPersonalization,
    ScrapbookPersonalization,
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

PROPOSAL_THEMES = {
    "candlelight-question",
    "bold-question",
    "quiet-moment",
}

APOLOGY_THEMES = {
    "soft-reset",
    "honest-heart",
    "fresh-start",
}

ANNIVERSARY_THEMES = {
    "golden-chapters",
    "rose-years",
    "midnight-us",
}

LOVE_LETTER_THEMES = {
    "ink-and-paper",
    "late-night-letter",
    "rose-envelope",
}

SCRAPBOOK_THEMES = {
    "paper-memories",
    "polaroid-days",
    "keepsake-box",
}

FRIENDSHIP_THEMES = {
    "sunny-chaos",
    "inside-jokes",
    "golden-hour",
}

MOTHERS_DAY_THEMES = {
    "garden-love",
    "soft-heirloom",
    "warm-kitchen",
}

DEFAULT_BIRTHDAY_THEME = "warm-confetti"
DEFAULT_THANK_YOU_THEME = "pressed-flowers"
DEFAULT_PHOTO_PUZZLE_THEME = "classic-pieces"
DEFAULT_TEMPLATE_THEMES = {
    "proposal": "candlelight-question",
    "apology": "soft-reset",
    "anniversary": "golden-chapters",
    "love_letter": "ink-and-paper",
    "scrapbook": "paper-memories",
    "friendship": "sunny-chaos",
    "mothers_day": "garden-love",
}

TEMPLATE_THEMES = {
    "proposal": PROPOSAL_THEMES,
    "apology": APOLOGY_THEMES,
    "anniversary": ANNIVERSARY_THEMES,
    "love_letter": LOVE_LETTER_THEMES,
    "scrapbook": SCRAPBOOK_THEMES,
    "friendship": FRIENDSHIP_THEMES,
    "mothers_day": MOTHERS_DAY_THEMES,
}


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

        text_personalization = {
            "proposal": ProposalPersonalization,
            "apology": ApologyPersonalization,
            "anniversary": AnniversaryPersonalization,
            "love_letter": LoveLetterPersonalization,
            "scrapbook": ScrapbookPersonalization,
            "friendship": FriendshipPersonalization,
            "mothers_day": MothersDayPersonalization,
        }.get(template_key)

        if text_personalization is not None:
            validated = text_personalization.model_validate(
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

    if template_key in TEMPLATE_THEMES:
        if theme_key is None:
            return DEFAULT_TEMPLATE_THEMES[template_key]

        if theme_key not in TEMPLATE_THEMES[template_key]:
            raise PersonalizationValidationError(
                f"Invalid {template_key} theme.",
            )

        return theme_key

    raise PersonalizationValidationError(
        f"Unsupported template: {template_key}.",
    )
