from datetime import UTC, datetime
from uuid import uuid4

import pytest

from app.core.config import settings
from app.models import Draft, Gift, Notification, Order, Product
from app.services import notification_providers
from app.services.notification_providers import (
    DeliveryResult,
    NotificationDeliveryError,
)
from app.services.notifications import NotificationService


class PrepareSession:
    def __init__(self, existing: Notification | None = None) -> None:
        self.existing = existing
        self.added: Notification | None = None

    def scalar(self, statement: object) -> Notification | None:
        return self.existing

    def add(self, notification: Notification) -> None:
        notification.id = uuid4()
        self.added = notification

    def flush(self) -> None:
        return None


class ProcessingSession:
    def __init__(self, notification: Notification) -> None:
        self.notification = notification
        self.commit_count = 0

    def scalar(self, statement: object) -> Notification:
        return self.notification

    def commit(self) -> None:
        self.commit_count += 1


class SuccessfulProvider:
    def send(self, notification: Notification) -> DeliveryResult:
        return DeliveryResult(provider_message_id="provider-123")


class FailingProvider:
    def send(self, notification: Notification) -> DeliveryResult:
        raise NotificationDeliveryError("provider unavailable")


def make_gift_context() -> tuple[Gift, Draft, Order, Product]:
    gift_id = uuid4()
    draft = Draft(
        id=uuid4(),
        product_id=1,
        template_key="birthday",
        personalization={"recipient_name": "Alex"},
        expires_at=datetime.now(UTC),
    )
    order = Order(
        id=uuid4(),
        draft_id=draft.id,
        customer_email="customer@example.com",
    )
    gift = Gift(
        id=gift_id,
        draft_id=draft.id,
        order_id=order.id,
    )
    product = Product(
        id=1,
        name="Birthday Gift",
        slug="birthday",
        template_key="birthday",
    )

    return gift, draft, order, product


def test_prepare_gift_created_is_idempotent() -> None:
    gift, draft, order, product = make_gift_context()
    existing = Notification(
        id=uuid4(),
        dedupe_key="existing",
        event_type="gift_created",
        channel="email",
        recipient=order.customer_email,
        payload={},
    )
    session = PrepareSession(existing=existing)

    result = NotificationService(session).prepare_gift_created(
        gift=gift,
        draft=draft,
        order=order,
        product=product,
    )

    assert result is existing
    assert session.added is None


def test_prepare_gift_created_persists_private_link_payload() -> None:
    gift, draft, order, product = make_gift_context()
    session = PrepareSession()

    result = NotificationService(session).prepare_gift_created(
        gift=gift,
        draft=draft,
        order=order,
        product=product,
    )

    assert result is session.added
    assert result is not None
    assert result.event_type == "gift_created"
    assert result.recipient == "customer@example.com"
    assert result.payload["gift_url"].startswith("http")
    assert result.payload["recipient_name"] == "Alex"


def test_notification_processing_marks_success(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    notification = Notification(
        id=uuid4(),
        event_type="gift_created",
        channel="email",
        recipient="customer@example.com",
        payload={},
        status="pending",
        attempts=0,
        available_at=datetime.now(UTC),
    )
    session = ProcessingSession(notification)
    monkeypatch.setattr(
        "app.services.notifications.get_notification_provider",
        lambda channel: SuccessfulProvider(),
    )

    result = NotificationService(session).process(notification.id)

    assert result == "sent"
    assert notification.status == "sent"
    assert notification.provider_message_id == "provider-123"
    assert notification.sent_at is not None
    assert session.commit_count == 2


def test_notification_processing_persists_retry_state(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    notification = Notification(
        id=uuid4(),
        event_type="gift_created",
        channel="email",
        recipient="customer@example.com",
        payload={},
        status="pending",
        attempts=0,
        available_at=datetime.now(UTC),
    )
    session = ProcessingSession(notification)
    monkeypatch.setattr(
        "app.services.notifications.get_notification_provider",
        lambda channel: FailingProvider(),
    )
    original_max_retries = settings.notification_max_retries

    try:
        settings.notification_max_retries = 3

        with pytest.raises(NotificationDeliveryError):
            NotificationService(session).process(notification.id)
    finally:
        settings.notification_max_retries = original_max_retries

    assert notification.status == "pending"
    assert notification.attempts == 1
    assert notification.last_error == "provider unavailable"
    assert notification.available_at > datetime.now(UTC)


def test_console_email_provider_is_safe_for_local_development(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    notification = Notification(
        id=uuid4(),
        event_type="gift_created",
        channel="email",
        recipient="customer@example.com",
        payload={"gift_url": "http://localhost:3000/g/token"},
    )
    original_backend = settings.notification_email_backend

    try:
        settings.notification_email_backend = "console"
        result = notification_providers.EmailNotificationProvider().send(
            notification,
        )
    finally:
        settings.notification_email_backend = original_backend

    assert result.provider_message_id == f"console:{notification.id}"