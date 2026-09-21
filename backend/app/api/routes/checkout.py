from typing import Annotated

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
)
from app.services.checkout import (
    CheckoutService,
    CheckoutValidationError,
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
