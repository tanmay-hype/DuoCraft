from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class PhotoUploadRequest(BaseModel):
    filename: str = Field(
        min_length=1,
        max_length=255,
    )
    content_type: str = Field(
        min_length=1,
        max_length=100,
    )
    size_bytes: int = Field(gt=0)


class PhotoUploadResponse(BaseModel):
    asset_id: UUID
    upload_url: str
    storage_key: str
    expires_in_seconds: int


class PhotoAssetResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    draft_id: UUID
    original_filename: str
    content_type: str
    size_bytes: int
    status: str
    created_at: datetime
    updated_at: datetime


class PhotoViewUrlResponse(BaseModel):
    asset_id: UUID
    view_url: str
    expires_in_seconds: int
