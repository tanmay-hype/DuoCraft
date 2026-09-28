from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Path, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models import PhotoAsset
from app.schemas.gift import (
    PublicGiftPhoto,
    PublicGiftProduct,
    PublicGiftResponse,
)
from app.services.gift import (
    GiftExpiredError,
    GiftNotFoundError,
    GiftService,
)
from app.services.storage import StorageService

router = APIRouter(
    prefix="/g",
    tags=["gifts"],
)


@router.get(
    "/{token}",
    response_model=PublicGiftResponse,
)
def get_public_gift(
    token: Annotated[
        str,
        Path(min_length=32, max_length=128),
    ],
    db: Annotated[Session, Depends(get_db)],
) -> PublicGiftResponse:
    gift_service = GiftService(db)

    try:
        public_gift = gift_service.get_gift_by_token(
            token=token,
        )
    except GiftExpiredError as exc:
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="This gift has expired.",
        ) from exc
    except GiftNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gift not found.",
        ) from exc

    personalization = public_gift.draft.personalization or {}

    selected_photo_id = personalization.get(
        "photo_asset_id",
    )

    public_photos: list[PublicGiftPhoto] = []

    if selected_photo_id:
        try:
            selected_asset_id = UUID(
                str(selected_photo_id),
            )
        except ValueError:
            selected_asset_id = None

        if selected_asset_id is not None:
            photo = (
                db.query(PhotoAsset)
                .filter(
                    PhotoAsset.id == selected_asset_id,
                    PhotoAsset.draft_id == public_gift.draft.id,
                    PhotoAsset.status == "uploaded",
                )
                .one_or_none()
            )

            if photo is not None:
                storage = StorageService()

                view_url = storage.create_view_url(
                    storage_key=photo.storage_key,
                )

                public_photos.append(
                    PublicGiftPhoto(
                        asset_id=photo.id,
                        view_url=view_url,
                        expires_in_seconds=(settings.photo_view_url_expiry_seconds),
                    )
                )

    return PublicGiftResponse(
        gift_id=public_gift.gift.id,
        status=public_gift.gift.status,
        product=PublicGiftProduct(
            name=public_gift.product.name,
            slug=public_gift.product.slug,
            template_key=public_gift.product.template_key,
        ),
        personalization=personalization,
        theme_key=public_gift.draft.theme_key,
        photos=public_photos,
    )
