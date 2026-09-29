from datetime import UTC, datetime, timedelta
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.draft_security import hash_owner_token
from app.models import Draft, PhotoAsset, Product
from app.schemas import DraftUpdate
from app.services.personalization import (
    PersonalizationValidationError,
    validate_personalization,
    validate_theme,
)


class DraftService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_active_product(
        self,
        product_id: int,
    ) -> Product | None:
        product = self.db.get(Product, product_id)

        if product is None or not product.is_active:
            return None

        return product

    def create_draft(
        self,
        product: Product,
        owner_token: str,
    ) -> Draft:
        expires_at = datetime.now(UTC) + timedelta(
            days=settings.draft_lifetime_days,
        )

        draft = Draft(
            product_id=product.id,
            owner_token_hash=hash_owner_token(owner_token),
            template_key=product.template_key,
            personalization={},
            expires_at=expires_at,
        )

        try:
            self.db.add(draft)
            self.db.commit()
            self.db.refresh(draft)
        except Exception:
            self.db.rollback()
            raise

        return draft

    def get_draft(
        self,
        draft_id: UUID,
    ) -> Draft | None:
        return self.db.get(Draft, draft_id)

    def is_expired(
        self,
        draft: Draft,
    ) -> bool:
        return draft.expires_at <= datetime.now(UTC)

    def update_draft(
        self,
        draft: Draft,
        data: DraftUpdate,
    ) -> Draft:
        updates = data.model_dump(exclude_unset=True)

        if "personalization" in updates:
            personalization = updates["personalization"]

            if personalization is not None:
                updates["personalization"] = validate_personalization(
                    draft.template_key,
                    personalization,
                )

                if draft.template_key == "photo_puzzle":
                    photo_asset_id = personalization.get(
                        "photo_asset_id",
                    )

                    if photo_asset_id is not None:
                        try:
                            selected_photo_id = UUID(
                                photo_asset_id,
                            )
                        except ValueError as exc:
                            raise PersonalizationValidationError(
                                "The selected photo is not available for this draft.",
                            ) from exc

                        photo = (
                            self.db.query(PhotoAsset)
                            .filter(
                                PhotoAsset.id == selected_photo_id,
                                PhotoAsset.draft_id == draft.id,
                                PhotoAsset.status == "uploaded",
                            )
                            .one_or_none()
                        )

                        if photo is None:
                            raise PersonalizationValidationError(
                                "The selected photo is not available for this draft.",
                            )

        if "theme_key" in updates:
            updates["theme_key"] = validate_theme(
                draft.template_key,
                updates["theme_key"],
            )

        for field, value in updates.items():
            setattr(draft, field, value)

        try:
            self.db.commit()
            self.db.refresh(draft)
        except Exception:
            self.db.rollback()
            raise

        return draft
