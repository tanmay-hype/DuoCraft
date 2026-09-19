from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class DraftCreate(BaseModel):
    product_id: int = Field(gt=0)


class DraftUpdate(BaseModel):
    personalization: dict[str, Any] | None = None
    theme_key: str | None = Field(
        default=None,
        max_length=100,
    )


class DraftResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    product_id: int
    template_key: str
    personalization: dict[str, Any]
    theme_key: str | None
    created_at: datetime
    updated_at: datetime
    expires_at: datetime
