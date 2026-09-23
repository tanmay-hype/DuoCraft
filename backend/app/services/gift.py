from dataclasses import dataclass
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.gift_security import (
    generate_gift_token,
    hash_gift_token,
)
from app.models import Draft, Gift, Order


class GiftCreationError(Exception):
    """Raised when a gift cannot be created."""


@dataclass(frozen=True)
class CreatedGift:
    gift: Gift
    raw_token: str


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
            raise GiftCreationError("A gift already exists for this order.")

        raw_token = generate_gift_token()
        token_hash = hash_gift_token(raw_token)

        gift = Gift(
            draft_id=draft.id,
            order_id=order.id,
            share_token_hash=token_hash,
            status="active",
        )

        try:
            self.db.add(gift)
            self.db.commit()
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
    ) -> Gift | None:
        token_hash = hash_gift_token(token)

        return (
            self.db.query(Gift)
            .filter(
                Gift.share_token_hash == token_hash,
                Gift.status == "active",
            )
            .one_or_none()
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
