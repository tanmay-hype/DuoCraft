from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies.drafts import get_owned_draft
from app.core.config import settings
from app.core.database import get_db
from app.models.draft import Draft
from app.models.photo_asset import PhotoAsset
from app.schemas.photo_asset import (
    PhotoAssetResponse,
    PhotoUploadRequest,
    PhotoUploadResponse,
    PhotoViewUrlResponse,
)
from app.services.photo_assets import (
    PhotoAssetNotFoundError,
    PhotoAssetService,
    PhotoAssetValidationError,
)
from app.services.storage import StorageError

router = APIRouter(
    prefix="/drafts/{draft_id}/photos",
    tags=["photos"],
)

DatabaseSession = Annotated[
    Session,
    Depends(get_db),
]

OwnedDraft = Annotated[
    Draft,
    Depends(get_owned_draft),
]


@router.post(
    "",
    response_model=PhotoUploadResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_photo_upload(
    payload: PhotoUploadRequest,
    draft: OwnedDraft,
    db: DatabaseSession,
) -> PhotoUploadResponse:
    service = PhotoAssetService(db)

    try:
        asset, upload_url = service.create_pending_upload(
            draft=draft,
            filename=payload.filename,
            content_type=payload.content_type,
            size_bytes=payload.size_bytes,
        )
    except PhotoAssetValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc
    except StorageError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Photo storage is temporarily unavailable.",
        ) from exc

    return PhotoUploadResponse(
        asset_id=asset.id,
        upload_url=upload_url,
        storage_key=asset.storage_key,
        expires_in_seconds=settings.photo_upload_url_expiry_seconds,
    )


@router.post(
    "/{asset_id}/confirm",
    response_model=PhotoAssetResponse,
)
def confirm_photo_upload(
    asset_id: UUID,
    draft: OwnedDraft,
    db: DatabaseSession,
) -> PhotoAssetResponse:
    service = PhotoAssetService(db)

    try:
        return service.confirm_upload(
            draft=draft,
            asset_id=asset_id,
        )
    except PhotoAssetNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photo asset not found.",
        ) from exc
    except PhotoAssetValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc
    except StorageError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to verify the uploaded photo.",
        ) from exc


@router.get(
    "",
    response_model=list[PhotoAssetResponse],
)
def list_draft_photos(
    draft: OwnedDraft,
    db: DatabaseSession,
) -> list[PhotoAsset]:
    service = PhotoAssetService(db)

    return service.list_for_draft(
        draft=draft,
    )


@router.get(
    "/{asset_id}/view-url",
    response_model=PhotoViewUrlResponse,
)
def get_photo_view_url(
    asset_id: UUID,
    draft: OwnedDraft,
    db: DatabaseSession,
) -> PhotoViewUrlResponse:
    service = PhotoAssetService(db)

    try:
        asset, view_url = service.create_view_url(
            draft=draft,
            asset_id=asset_id,
        )
    except PhotoAssetNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photo asset not found.",
        ) from exc
    except PhotoAssetValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc
    except StorageError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to create photo preview.",
        ) from exc

    return PhotoViewUrlResponse(
        asset_id=asset.id,
        view_url=view_url,
        expires_in_seconds=(settings.photo_upload_url_expiry_seconds),
    )
