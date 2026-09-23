from dataclasses import dataclass
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.gift_security import (
    generate_gift_token,
    hash_gift_token,
)
from app.models import Draft, Gift, Order, Product


class GiftCreationError(Exception):
    """Raised when a gift cannot be created."""


class GiftNotFoundError(Exception):
    """Raised when a public gift cannot be found."""


@dataclass(frozen=True)
class CreatedGift:
    gift: Gift
    raw_token: str


@dataclass(frozen=True)
class PublicGiftData:
    gift: Gift
    draft: Draft
    product: Product


class GiftService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create_gift_for_paid_order(
        self,
        *,
        order: Order,
        draft: Draft,
    ) -> CreatedGift:
        if order.status != "paid":
            raise GiftCreationError("A gift can only be created for a paid order.")

        if order.draft_id != draft.id:
            raise GiftCreationError("The order does not belong to this draft.")

        existing_gift = self.db.query(Gift).filter(Gift.order_id == order.id).one_or_none()

        if existing_gift is not None:
            if existing_gift.status != "active":
                raise GiftCreationError("An inactive gift already exists for this order.")

            return CreatedGift(
                gift=existing_gift,
                raw_token=generate_gift_token(
                    existing_gift.id,
                ),
            )

        gift = Gift(
            draft_id=draft.id,
            order_id=order.id,
            share_token_hash="",
            status="active",
        )

        try:
            self.db.add(gift)
            self.db.flush()

            raw_token = generate_gift_token(gift.id)

            gift.share_token_hash = hash_gift_token(
                raw_token,
            )

            self.db.flush()
            self.db.refresh(gift)

        except Exception:
            self.db.rollback()
            raise

        return CreatedGift(
            gift=gift,
            raw_token=raw_token,
        )

    def get_gift_by_token(
        self,
        *,
        token: str,
    ) -> PublicGiftData:
        token_hash = hash_gift_token(token)

        gift = (
            self.db.query(Gift)
            .filter(
                Gift.share_token_hash == token_hash,
                Gift.status == "active",
            )
            .one_or_none()
        )

        if gift is None:
            raise GiftNotFoundError("Gift not found.")

        draft = self.db.query(Draft).filter(Draft.id == gift.draft_id).one_or_none()

        if draft is None:
            raise GiftNotFoundError("Gift draft not found.")

        product = self.db.query(Product).filter(Product.id == draft.product_id).one_or_none()

        if product is None:
            raise GiftNotFoundError("Gift product not found.")

        return PublicGiftData(
            gift=gift,
            draft=draft,
            product=product,
        )

    def get_gift_by_id(
        self,
        *,
        gift_id: UUID,
    ) -> Gift | None:
        return (
            self.db.query(Gift)
            .filter(
                Gift.id == gift_id,
                Gift.status == "active",
            )
            .one_or_none()
        )

    def get_share_token(
        self,
        *,
        gift: Gift,
    ) -> str:
        if gift.status != "active":
            raise GiftCreationError("Only active gifts have share tokens.")

        return generate_gift_token(gift.id)
