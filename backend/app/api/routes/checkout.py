from datetime import UTC, datetime
from uuid import UUID

from fastapi import APIRouter, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies.drafts import (
    DatabaseSession,
    DraftOwnerToken,
)
from app.core.config import settings
from app.core.draft_security import owner_token_matches
from app.core.gift_security import generate_gift_token
from app.models import Draft, Gift, Order
from app.schemas.checkout import (
    CheckoutGiftResponse,
    CheckoutOrderCreate,
    CheckoutOrderResponse,
    CheckoutOrderStatusResponse,
    PaymentOrderResponse,
    PaymentVerificationRequest,
    PaymentVerificationResponse,
)
from app.services.checkout import CheckoutService, CheckoutValidationError
from app.services.draft import DraftService
from app.services.payment import (
    PaymentProviderError,
    RazorpayService,
)

router = APIRouter(prefix="/checkout", tags=["checkout"])


def get_owned_order(
    *,
    db: Session,
    order_id: UUID,
    owner_token: str | None,
) -> Order:
    order = db.get(Order, order_id)

    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found.",
        )

    draft = db.get(Draft, order.draft_id)

    if draft is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Draft not found.",
        )

    if owner_token is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this order.",
        )

    if not owner_token_matches(
        owner_token,
        draft.owner_token_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this order.",
        )

    return order


@router.post(
    "/orders",
    response_model=CheckoutOrderResponse,
)
def create_checkout_order(
    payload: CheckoutOrderCreate,
    db: DatabaseSession,
    owner_token: DraftOwnerToken = None,
) -> CheckoutOrderResponse:
    draft_service = DraftService(db)

    draft = draft_service.get_draft(payload.draft_id)

    if draft is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Draft not found.",
        )

    if draft_service.is_expired(draft):
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="This draft has expired.",
        )

    if owner_token is None or not owner_token_matches(
        owner_token,
        draft.owner_token_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this draft.",
        )

    checkout_service = CheckoutService(db)

    try:
        order = checkout_service.create_order(
            draft=draft,
            addon_ids=payload.addon_ids,
            customer_email=(str(payload.customer_email) if payload.customer_email else None),
        )
    except CheckoutValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    return CheckoutOrderResponse(
        order_id=order.id,
        draft_id=order.draft_id,
        status=order.status,
        currency=order.currency,
        subtotal_amount=order.subtotal_amount,
        addon_amount=order.addon_amount,
        total_amount=order.total_amount,
        customer_email=order.customer_email,
        pricing_snapshot=order.pricing_snapshot,
    )


@router.get(
    "/orders/{order_id}",
    response_model=CheckoutOrderStatusResponse,
)
def get_checkout_order_status(
    order_id: UUID,
    db: DatabaseSession,
    owner_token: DraftOwnerToken = None,
) -> CheckoutOrderStatusResponse:
    order = get_owned_order(
        db=db,
        order_id=order_id,
        owner_token=owner_token,
    )

    return CheckoutOrderStatusResponse(
        order_id=order.id,
        draft_id=order.draft_id,
        status=order.status,
        currency=order.currency,
        total_amount=order.total_amount,
    )


@router.post(
    "/orders/{order_id}/payment",
    response_model=PaymentOrderResponse,
)
def create_payment_order(
    order_id: UUID,
    db: DatabaseSession,
    owner_token: DraftOwnerToken = None,
) -> PaymentOrderResponse:
    order = get_owned_order(
        db=db,
        order_id=order_id,
        owner_token=owner_token,
    )

    if order.status not in {"pending", "payment_pending"}:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Order is not available for payment.",
        )

    if order.total_amount < 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Razorpay orders must be at least 100 paise.",
        )

    if order.payment_provider == "razorpay" and order.provider_order_id:
        return PaymentOrderResponse(
            order_id=order.id,
            provider="razorpay",
            provider_order_id=order.provider_order_id,
            amount=order.total_amount,
            currency=order.currency,
            key_id=settings.razorpay_key_id,
        )

    razorpay = RazorpayService()

    try:
        provider_order = razorpay.create_order(
            amount=order.total_amount,
            currency=order.currency,
            receipt=str(order.id),
        )
    except PaymentProviderError as exc:
        raise HTTPException(
            status_code=exc.status_code or status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        ) from exc
    finally:
        razorpay.close()

    order.payment_provider = "razorpay"
    order.provider_order_id = provider_order["id"]
    order.status = "payment_pending"

    db.commit()
    db.refresh(order)

    return PaymentOrderResponse(
        order_id=order.id,
        provider="razorpay",
        provider_order_id=provider_order["id"],
        amount=order.total_amount,
        currency=order.currency,
        key_id=settings.razorpay_key_id,
    )


@router.post(
    "/orders/{order_id}/verify-payment",
    response_model=PaymentVerificationResponse,
)
def verify_payment(
    order_id: UUID,
    payload: PaymentVerificationRequest,
    db: DatabaseSession,
    owner_token: DraftOwnerToken = None,
) -> PaymentVerificationResponse:
    order = get_owned_order(
        db=db,
        order_id=order_id,
        owner_token=owner_token,
    )

    if order.payment_provider != "razorpay":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Order is not configured for Razorpay.",
        )

    if order.provider_order_id != payload.razorpay_order_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment order does not match this order.",
        )

    razorpay = RazorpayService()

    try:
        signature_valid = razorpay.verify_payment_signature(
            order_id=payload.razorpay_order_id,
            payment_id=payload.razorpay_payment_id,
            signature=payload.razorpay_signature,
        )

        if not signature_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid payment signature.",
            )

        payment = razorpay.get_payment(
            payment_id=payload.razorpay_payment_id,
        )
    except PaymentProviderError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        ) from exc
    finally:
        razorpay.close()

    if payment.get("order_id") != order.provider_order_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment does not belong to this order.",
        )

    if int(payment.get("amount", -1)) != order.total_amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment amount does not match the order.",
        )

    if payment.get("currency") != order.currency:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment currency does not match the order.",
        )

    order.provider_payment_id = payload.razorpay_payment_id

    if order.status == "pending":
        order.status = "payment_pending"

    db.commit()

    return PaymentVerificationResponse(
        order_id=order.id,
        status=order.status,
        payment_id=payload.razorpay_payment_id,
    )


@router.get(
    "/orders/{order_id}/gift",
    response_model=CheckoutGiftResponse,
)
def get_checkout_gift(
    order_id: UUID,
    db: DatabaseSession,
    owner_token: DraftOwnerToken = None,
) -> CheckoutGiftResponse:
    order = db.get(Order, order_id)

    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found.",
        )

    draft = db.get(Draft, order.draft_id)

    if draft is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Draft not found.",
        )

    if draft.expires_at is not None and draft.expires_at <= datetime.now(UTC):
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="Draft has expired.",
        )

    if owner_token is None or not owner_token_matches(
        owner_token,
        draft.owner_token_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this order.",
        )

    if order.draft_id != draft.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this order.",
        )

    if order.status != "paid":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Payment has not been confirmed.",
        )

    gift = (
        db.query(Gift)
        .filter(
            Gift.order_id == order.id,
            Gift.status == "active",
        )
        .one_or_none()
    )

    if gift is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gift is not available yet.",
        )

    token = generate_gift_token(gift.id)

    gift_url = f"{settings.frontend_origin}/g/{token}"

    return CheckoutGiftResponse(
        order_id=order.id,
        gift_id=gift.id,
        gift_url=gift_url,
    )
