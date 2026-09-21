from pydantic import BaseModel, ConfigDict, Field


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
