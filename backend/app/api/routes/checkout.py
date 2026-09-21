from typing import Annotated
from uuid import UUID

from fastapi import (
    APIRouter,
    Cookie,
    Depends,
    HTTPException,
    status,
)
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.draft_security import owner_token_matches
from app.schemas.checkout import (
    CheckoutOrderCreate,
    CheckoutOrderResponse,
    CheckoutPricingSnapshot,
    CheckoutAddonSnapshot,
    CheckoutProductSnapshot,
    PaymentOrderResponse,
)
from app.services.checkout import (
    CheckoutService,
    CheckoutValidationError,
)
from app.models import Order
from app.services.payment import (
    PaymentProviderError,
    RazorpayService,
)
from app.services.draft import DraftService


router = APIRouter(
    prefix="/checkout",
    tags=["checkout"],
)


@router.post(
    "/orders",
    response_model=CheckoutOrderResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_checkout_order(
    data: CheckoutOrderCreate,
    db: Annotated[Session, Depends(get_db)],
    owner_token: Annotated[
        str | None,
        Cookie(alias=settings.draft_cookie_name),
    ] = None,
) -> CheckoutOrderResponse:
    draft_service = DraftService(db)

    draft = draft_service.get_draft(data.draft_id)

    if draft is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Draft not found.",
        )

    if draft_service.is_expired(draft):
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
            detail="You do not have access to this draft.",
        )

    service = CheckoutService(db)

    try:
        order = service.create_order(
            draft=draft,
            addon_ids=data.addon_ids,
            customer_email=data.customer_email,
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
        pricing_snapshot=CheckoutPricingSnapshot.model_validate(
            order.pricing_snapshot,
        ),
    )

@router.post(
    "/orders/{order_id}/payment",
    response_model=PaymentOrderResponse,
)
def create_payment_order(
    order_id: UUID,
    db: Annotated[Session, Depends(get_db)],
    owner_token: Annotated[
        str | None,
        Cookie(alias=settings.draft_cookie_name),
    ] = None,
) -> PaymentOrderResponse:
    order = db.get(Order, order_id)

    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found.",
        )

    draft_service = DraftService(db)

    draft = draft_service.get_draft(order.draft_id)

    if draft is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Draft not found.",
        )

    if draft_service.is_expired(draft):
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

    if order.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Order is not available for payment.",
        )

    if order.provider_order_id:
        return PaymentOrderResponse(
            order_id=order.id,
            provider=order.payment_provider or "razorpay",
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
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        ) from exc
    finally:
        razorpay.close()

    order.payment_provider = "razorpay"
    order.provider_order_id = provider_order["id"]

    try:
        db.commit()
        db.refresh(order)
    except Exception:
        db.rollback()
        raise

    return PaymentOrderResponse(
        order_id=order.id,
        provider="razorpay",
        provider_order_id=order.provider_order_id,
        amount=order.total_amount,
        currency=order.currency,
        key_id=settings.razorpay_key_id,
    )