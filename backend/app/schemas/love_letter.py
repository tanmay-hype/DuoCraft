from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class LoveLetterGenerateRequest(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        str_strip_whitespace=True,
    )

    recipient_name: str = Field(min_length=1, max_length=60)
    relationship: str = Field(min_length=1, max_length=80)
    memories: str = Field(min_length=1, max_length=1200)
    language: Literal["english", "hindi"] = "english"
    tone: Literal["tender", "playful", "poetic", "sincere"] = "tender"
    length: Literal["short", "medium", "long"] = "medium"

class LoveLetterGenerateResponse(BaseModel):
    headline: str
    message: str
    model: str
    remaining_requests: int
    provider: Literal["gemini", "ollama"]