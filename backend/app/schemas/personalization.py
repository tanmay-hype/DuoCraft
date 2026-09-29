from pydantic import BaseModel, ConfigDict, Field, field_validator


class BirthdayPersonalization(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        str_strip_whitespace=True,
    )

    recipient_name: str = Field(
        min_length=1,
        max_length=60,
    )
    sender_name: str = Field(
        min_length=1,
        max_length=60,
    )
    headline: str = Field(
        min_length=1,
        max_length=100,
    )
    message: str = Field(
        min_length=1,
        max_length=1000,
    )


class ThankYouPersonalization(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        str_strip_whitespace=True,
    )

    recipient_name: str = Field(
        min_length=1,
        max_length=60,
    )
    sender_name: str = Field(
        min_length=1,
        max_length=60,
    )
    headline: str = Field(
        min_length=1,
        max_length=100,
    )
    message: str = Field(
        min_length=1,
        max_length=1000,
    )


class PhotoPuzzlePersonalization(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        str_strip_whitespace=True,
    )

    recipient_name: str = Field(
        min_length=1,
        max_length=60,
    )
    sender_name: str = Field(
        min_length=1,
        max_length=60,
    )
    message: str = Field(
        min_length=1,
        max_length=500,
    )
    photo_asset_id: str | None = None


class ProposalPersonalization(BirthdayPersonalization):
    pass


class ApologyPersonalization(BirthdayPersonalization):
    pass


class AnniversaryPersonalization(BirthdayPersonalization):
    pass


class LoveLetterPersonalization(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        str_strip_whitespace=True,
    )

    recipient_name: str = Field(min_length=1, max_length=60)
    sender_name: str = Field(min_length=1, max_length=60)
    headline: str = Field(min_length=1, max_length=100)
    message: str = Field(min_length=400, max_length=8000)

    @field_validator("message")
    @classmethod
    def require_long_letter(cls, value: str) -> str:
        if len(value.split()) < 400:
            raise ValueError("Love Letters must contain at least 400 words.")

        return value


class ScrapbookPersonalization(BirthdayPersonalization):
    pass


class FriendshipPersonalization(BirthdayPersonalization):
    pass


class MothersDayPersonalization(BirthdayPersonalization):
    pass
