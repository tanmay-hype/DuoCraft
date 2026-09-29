import logging
from datetime import UTC, datetime, timedelta
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.gift_security import generate_gift_token
from app.models import Draft, Gift, Notification, Order, Product
from app.services.notification_providers import (
    NotificationDeliveryError,
    get_notification_provider,
)

logger = logging.getLogger(__name__)


class NotificationService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def prepare_gift_created(
        self,
        *,
        gift: Gift,
        draft: Draft,
        order: Order,
        product: Product,
    ) -> Notification | None:
        if not order.customer_email:
            return None

        dedupe_key = f"gift-created:{gift.id}:email:{order.customer_email}"
        existing = self.db.scalar(
            select(Notification).where(
                Notification.dedupe_key == dedupe_key,
            )
        )

        if existing is not None:
            return existing

        gift_url = (
            f"{settings.frontend_origin}/g/"
            f"{generate_gift_token(gift.id)}"
        )

        notification = Notification(
            gift_id=gift.id,
            dedupe_key=dedupe_key,
            event_type="gift_created",
            channel="email",
            recipient=order.customer_email,
            payload={
                "gift_url": gift_url,
                "product_name": product.name,
                "recipient_name": str(
                    (draft.personalization or {}).get(
                        "recipient_name",
                        "someone special",
                    ),
                ),
            },
            status="pending",
        )
        self.db.add(notification)
        self.db.flush()

        return notification

    def process(
        self,
        notification_id: UUID,
    ) -> str:
        notification = self.db.scalar(
            select(Notification)
            .where(
                Notification.id == notification_id,
                Notification.status == "pending",
            )
            .with_for_update()
        )

        if notification is None:
            return "ignored"

        if notification.available_at > datetime.now(UTC):
            return "delayed"

        notification.status = "processing"
        notification.attempts += 1
        self.db.commit()

        provider = get_notification_provider(notification.channel)

        try:
            result = provider.send(notification)
        except NotificationDeliveryError as exc:
            notification.status = (
                "failed"
                if notification.attempts >= settings.notification_max_retries
                else "pending"
            )
            notification.last_error = str(exc)
            notification.available_at = datetime.now(UTC) + timedelta(
                seconds=(
                    settings.notification_retry_delay_seconds
                    * max(1, notification.attempts)
                ),
            )
            self.db.commit()
            raise

        notification.status = "sent"
        notification.provider_message_id = result.provider_message_id
        notification.sent_at = datetime.now(UTC)
        notification.last_error = None
        self.db.commit()

        return "sent"


def publish_notification(notification_id: UUID) -> None:
    from app.worker import deliver_notification

    try:
        deliver_notification.delay(str(notification_id))
    except Exception:
        logger.exception(
            "Unable to enqueue notification; it remains durable in the database: %s",
            notification_id,
        )