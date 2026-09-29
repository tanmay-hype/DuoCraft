import pytest

from app.services.personalization import (
    PersonalizationValidationError,
    validate_personalization,
    validate_theme,
)

TEMPLATES = (
    "proposal",
    "apology",
    "anniversary",
    "love_letter",
    "scrapbook",
    "friendship",
    "mothers_day",
)

LONG_MESSAGE = " ".join(["love"] * 400)


@pytest.mark.parametrize("template_key", TEMPLATES)
def test_remaining_templates_validate_strict_text_personalization(
    template_key: str,
) -> None:
    validated = validate_personalization(
        template_key,
        {
            "recipient_name": "Alex",
            "sender_name": "Sam",
            "headline": "A little something",
            "message": (
                LONG_MESSAGE
                if template_key == "love_letter"
                else "This is a complete message."
            ),
        },
    )

    assert validated["recipient_name"] == "Alex"


@pytest.mark.parametrize("template_key", TEMPLATES)
def test_remaining_templates_reject_unknown_fields(
    template_key: str,
) -> None:
    with pytest.raises(PersonalizationValidationError):
        validate_personalization(
            template_key,
            {
                "recipient_name": "Alex",
                "sender_name": "Sam",
                "headline": "A little something",
                "message": (
                    LONG_MESSAGE
                    if template_key == "love_letter"
                    else "This is a complete message."
                ),
                "unexpected": "field",
            },
        )


@pytest.mark.parametrize("template_key", TEMPLATES)
def test_remaining_templates_have_valid_default_theme(
    template_key: str,
) -> None:
    assert validate_theme(template_key, None)


@pytest.mark.parametrize("template_key", TEMPLATES)
def test_remaining_templates_reject_invalid_theme(
    template_key: str,
) -> None:
    with pytest.raises(PersonalizationValidationError):
        validate_theme(template_key, "not-a-theme")