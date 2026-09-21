from pathlib import Path
from secrets import token_urlsafe
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.draft import Draft
from app.models.photo_asset import PhotoAsset
from app.services.storage import StorageError, StorageService

ALLOWED_PHOTO_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
}


class PhotoAssetValidationError(Exception):
    pass


class PhotoAssetNotFoundError(Exception):
    pass


class PhotoAssetService:
    def __init__(
        self,
        db: Session,
        storage: StorageService | None = None,
    ) -> None:
        self.db = db
        self.storage = storage or StorageService()

    def create_pending_upload(
        self,
        *,
        draft: Draft,
        filename: str,
        content_type: str,
        size_bytes: int,
    ) -> tuple[PhotoAsset, str]:
        self._validate_upload(
            filename=filename,
            content_type=content_type,
            size_bytes=size_bytes,
        )

        extension = self._extension_for_content_type(content_type)
        object_token = token_urlsafe(24)

        storage_key = f"drafts/{draft.id}/photos/{object_token}{extension}"

        asset = PhotoAsset(
            draft_id=draft.id,
            storage_key=storage_key,
            original_filename=filename,
            content_type=content_type,
            size_bytes=size_bytes,
            status="pending",
        )

        self.db.add(asset)
        self.db.flush()

        try:
            upload_url = self.storage.create_upload_url(
                storage_key=storage_key,
                content_type=content_type,
            )
        except StorageError:
            self.db.rollback()
            raise

        self.db.commit()
        self.db.refresh(asset)

        return asset, upload_url

    def confirm_upload(
        self,
        *,
        draft: Draft,
        asset_id: UUID,
    ) -> PhotoAsset:
        asset = (
            self.db.query(PhotoAsset)
            .filter(
                PhotoAsset.id == asset_id,
                PhotoAsset.draft_id == draft.id,
            )
            .one_or_none()
        )

        if asset is None:
            raise PhotoAssetNotFoundError

        metadata = self.storage.get_object_metadata(
            storage_key=asset.storage_key,
        )

        if metadata.size_bytes != asset.size_bytes:
            raise PhotoAssetValidationError("Uploaded file size does not match.")

        if metadata.content_type != asset.content_type:
            raise PhotoAssetValidationError("Uploaded file type does not match.")

        asset.status = "uploaded"

        self.db.commit()
        self.db.refresh(asset)

        return asset

    def list_for_draft(
        self,
        *,
        draft: Draft,
    ) -> list[PhotoAsset]:
        return (
            self.db.query(PhotoAsset)
            .filter(PhotoAsset.draft_id == draft.id)
            .order_by(PhotoAsset.created_at.desc())
            .all()
        )

    def create_view_url(
        self,
        *,
        draft: Draft,
        asset_id: UUID,
    ) -> tuple[PhotoAsset, str]:
        asset = (
            self.db.query(PhotoAsset)
            .filter(
                PhotoAsset.id == asset_id,
                PhotoAsset.draft_id == draft.id,
            )
            .one_or_none()
        )

        if asset is None:
            raise PhotoAssetNotFoundError

        if asset.status != "uploaded":
            raise PhotoAssetValidationError("Photo asset is not uploaded yet.")

        view_url = self.storage.create_view_url(
            storage_key=asset.storage_key,
        )

        return asset, view_url
    
    def _validate_upload(
        self,
        *,
        filename: str,
        content_type: str,
        size_bytes: int,
    ) -> None:
        if content_type not in ALLOWED_PHOTO_CONTENT_TYPES:
            raise PhotoAssetValidationError("Only JPEG, PNG, and WebP images are supported.")

        if size_bytes > settings.photo_upload_max_bytes:
            max_mb = settings.photo_upload_max_bytes // (1024 * 1024)

            raise PhotoAssetValidationError(f"Photo must be {max_mb} MB or smaller.")

        if not Path(filename).suffix:
            raise PhotoAssetValidationError("Photo filename must include an extension.")

    @staticmethod
    def _extension_for_content_type(
        content_type: str,
    ) -> str:
        extensions = {
            "image/jpeg": ".jpg",
            "image/png": ".png",
            "image/webp": ".webp",
        }

        return extensions[content_type]
