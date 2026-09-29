import logging
import smtplib
from dataclasses import dataclass
from email.message import EmailMessage
from typing import Protocol

import httpx

from app.core.config import settings
from app.models import Notification

logger = logging.getLogger(__name__)


class NotificationDeliveryError(Exception):
    """Raised when a notification provider cannot deliver a message."""


@dataclass(frozen=True)
class DeliveryResult:
    provider_message_id: str | None = None


class NotificationProvider(Protocol):
    def send(self, notification: Notification) -> DeliveryResult:
        ...


def _gift_message(notification: Notification) -> tuple[str, str]:
    payload = notification.payload
    recipient_name = str(payload.get("recipient_name") or "someone special")
    product_name = str(payload.get("product_name") or "your DuoCraft gift")
    gift_url = str(payload.get("gift_url") or "")

    subject = f"Your {product_name} is ready to share"
    body = (
        f"Hi,\n\nYour personalized {product_name} for {recipient_name} is ready.\n\n"
        f"Share the private gift link:\n{gift_url}\n\n"
        "With love,\nDuoCraft"
    )

    return subject, body


class EmailNotificationProvider:
    def send(self, notification: Notification) -> DeliveryResult:
        subject, body = _gift_message(notification)

        if settings.notification_email_backend == "console":
            logger.info(
                "Notification delivered in console mode: type=%s recipient=%s",
                notification.event_type,
                notification.recipient,
            )
            return DeliveryResult(
                provider_message_id=f"console:{notification.id}",
            )

        if settings.notification_email_backend != "smtp":
            raise NotificationDeliveryError(
                "Unsupported notification email backend.",
            )

        if not settings.smtp_host:
            raise NotificationDeliveryError(
                "SMTP host is not configured.",
            )

        message = EmailMessage()
        message["From"] = settings.notification_from_email
        message["To"] = notification.recipient
        message["Subject"] = subject
        message.set_content(body)

        try:
            with smtplib.SMTP(
                settings.smtp_host,
                settings.smtp_port,
                timeout=10,
            ) as client:
                if settings.smtp_use_tls:
                    client.starttls()

                if settings.smtp_username and settings.smtp_password:
                    client.login(
                        settings.smtp_username,
                        settings.smtp_password,
                    )

                client.send_message(message)
        except (OSError, smtplib.SMTPException) as exc:
            raise NotificationDeliveryError(
                "SMTP delivery failed.",
            ) from exc

        return DeliveryResult(
            provider_message_id=message.get("Message-ID"),
        )


class TwilioWhatsAppProvider:
    def send(self, notification: Notification) -> DeliveryResult:
        if not all(
            (
                settings.twilio_account_sid,
                settings.twilio_auth_token,
                settings.twilio_whatsapp_from,
            )
        ):
            raise NotificationDeliveryError(
                "Twilio WhatsApp is not configured.",
            )

        _, body = _gift_message(notification)
        endpoint = (
            "https://api.twilio.com/2010-04-01/Accounts/"
            f"{settings.twilio_account_sid}/Messages.json"
        )

        try:
            response = httpx.post(
                endpoint,
                data={
                    "From": f"whatsapp:{settings.twilio_whatsapp_from}",
                    "To": f"whatsapp:{notification.recipient}",
                    "Body": body,
                },
                auth=(
                    settings.twilio_account_sid,
                    settings.twilio_auth_token,
                ),
                timeout=10,
            )
        except httpx.HTTPError as exc:
            raise NotificationDeliveryError(
                "WhatsApp provider request failed.",
            ) from exc

        if response.is_error:
            raise NotificationDeliveryError(
                f"WhatsApp provider rejected the message (HTTP {response.status_code}).",
            )

        data = response.json()
        provider_message_id = data.get("sid")

        return DeliveryResult(
            provider_message_id=(
                provider_message_id
                if isinstance(provider_message_id, str)
                else None
            ),
        )


def get_notification_provider(channel: str) -> NotificationProvider:
    if channel == "email":
        return EmailNotificationProvider()

    if channel == "whatsapp":
        return TwilioWhatsAppProvider()

    raise NotificationDeliveryError(
        f"Unsupported notification channel: {channel}.",
    )