import json
from datetime import UTC, datetime
from typing import Annotated, Any

from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models import Draft, Order, PaymentEvent
from app.services.gift import GiftCreationError, GiftService
from app.services.payment import RazorpayService

router = APIRouter(
    prefix="/payments",
    tags=["payments"],
)


def _extract_provider_order_id(
    payload: dict[str, Any],
) -> str | None:
    event_type = payload.get("event")
    event_payload = payload.get("payload", {})

    if event_type == "order.paid":
        order_entity = event_payload.get("order", {}).get("entity", {})

        provider_order_id = order_entity.get("id")

        return provider_order_id if isinstance(provider_order_id, str) else None

    payment_entity = event_payload.get("payment", {}).get("entity", {})

    provider_order_id = payment_entity.get("order_id")

    return provider_order_id if isinstance(provider_order_id, str) else None


@router.post(
    "/webhook",
    status_code=status.HTTP_200_OK,
)
async def razorpay_webhook(
    request: Request,
    db: Annotated[Session, Depends(get_db)],
    x_razorpay_signature: Annotated[
        str | None,
        Header(alias="X-Razorpay-Signature"),
    ] = None,
    x_razorpay_event_id: Annotated[
        str | None,
        Header(alias="x-razorpay-event-id"),
    ] = None,
) -> dict[str, str]:
    raw_body = await request.body()

    if not settings.razorpay_webhook_secret:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Razorpay webhook is not configured.",
        )

    if not x_razorpay_signature:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing webhook signature.",
        )

    if not x_razorpay_event_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing webhook event ID.",
        )

    if not RazorpayService.verify_webhook_signature(
        raw_body=raw_body,
        signature=x_razorpay_signature,
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid webhook signature.",
        )

    try:
        payload = json.loads(raw_body)
    except json.JSONDecodeError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid webhook payload.",
        ) from exc

    if not isinstance(payload, dict):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid webhook payload.",
        )

    event_type = payload.get("event")

    if not isinstance(event_type, str):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing webhook event type.",
        )

    existing_event = db.scalar(
        select(PaymentEvent).where(
            PaymentEvent.provider == "razorpay",
            PaymentEvent.event_id == x_razorpay_event_id,
        )
    )

    if existing_event is not None:
        return {"status": "ok"}

    provider_order_id = _extract_provider_order_id(
        payload,
    )

    local_order = None

    if provider_order_id:
        local_order = db.scalar(
            select(Order).where(
                Order.provider_order_id == provider_order_id,
            )
        )

    local_order_id = local_order.id if local_order is not None else None

    payment_event = PaymentEvent(
        provider="razorpay",
        event_id=x_razorpay_event_id,
        event_type=event_type,
        order_id=local_order_id,
        payload=payload,
    )

    db.add(payment_event)

    if (
        event_type
        in {
            "payment.captured",
            "order.paid",
        }
        and local_order is not None
    ):
        event_payload = payload.get(
            "payload",
            {},
        )

        payment_entity = event_payload.get(
            "payment",
            {},
        ).get(
            "entity",
            {},
        )

        order_entity = event_payload.get(
            "order",
            {},
        ).get(
            "entity",
            {},
        )

        provider_payment_id = payment_entity.get(
            "id",
        )

        webhook_amount = payment_entity.get(
            "amount",
            order_entity.get("amount"),
        )

        webhook_currency = payment_entity.get(
            "currency",
            order_entity.get("currency"),
        )

        if webhook_amount == local_order.total_amount and webhook_currency == local_order.currency:
            local_order.status = "paid"

            if isinstance(
                provider_payment_id,
                str,
            ):
                local_order.provider_payment_id = provider_payment_id

            local_order.paid_at = datetime.now(UTC)

            draft = db.scalar(
                select(Draft).where(
                    Draft.id == local_order.draft_id,
                )
            )

            if draft is None:
                db.rollback()
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="The draft associated with this order was not found.",
                )

            gift_service = GiftService(db)

            try:
                gift_service.create_gift_for_paid_order(
                    order=local_order,
                    draft=draft,
                )
            except GiftCreationError as exc:
                db.rollback()
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=str(exc),
                ) from exc

    try:
        db.commit()
    except Exception:
        db.rollback()
        raise

    return {"status": "ok"}
