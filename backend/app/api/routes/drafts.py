from typing import Annotated
from uuid import UUID

from fastapi import (
    APIRouter,
    Cookie,
    Depends,
    HTTPException,
    Response,
    status,
)
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.draft_security import (
    generate_owner_token,
    owner_token_matches,
)
from app.schemas import (
    DraftCreate,
    DraftResponse,
    DraftUpdate,
)
from app.services.draft import DraftService
from app.services.personalization import (
    PersonalizationValidationError,
)

router = APIRouter(
    prefix="/drafts",
    tags=["drafts"],
)


def require_owned_draft(
    draft_id: UUID,
    owner_token: str | None,
    service: DraftService,
):
    draft = service.get_draft(draft_id)

    if draft is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Draft not found.",
        )

    if service.is_expired(draft):
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

    return draft


@router.post(
    "",
    response_model=DraftResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_draft(
    data: DraftCreate,
    response: Response,
    db: Annotated[Session, Depends(get_db)],
) -> DraftResponse:
    service = DraftService(db)

    product = service.get_active_product(data.product_id)

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found.",
        )

    owner_token = generate_owner_token()

    draft = service.create_draft(
        product=product,
        owner_token=owner_token,
    )

    response.set_cookie(
        key=settings.draft_cookie_name,
        value=owner_token,
        max_age=settings.draft_lifetime_days * 24 * 60 * 60,
        httponly=True,
        secure=settings.draft_cookie_secure,
        samesite="lax",
        path=f"/drafts/{draft.id}",
    )

    return draft


@router.get(
    "/{draft_id}",
    response_model=DraftResponse,
)
def get_draft(
    draft_id: UUID,
    db: Annotated[Session, Depends(get_db)],
    owner_token: Annotated[
        str | None,
        Cookie(alias=settings.draft_cookie_name),
    ] = None,
) -> DraftResponse:
    service = DraftService(db)

    return require_owned_draft(
        draft_id=draft_id,
        owner_token=owner_token,
        service=service,
    )


@router.patch(
    "/{draft_id}",
    response_model=DraftResponse,
)
def update_draft(
    draft_id: UUID,
    data: DraftUpdate,
    db: Annotated[Session, Depends(get_db)],
    owner_token: Annotated[
        str | None,
        Cookie(alias=settings.draft_cookie_name),
    ] = None,
) -> DraftResponse:
    service = DraftService(db)

    draft = require_owned_draft(
        draft_id=draft_id,
        owner_token=owner_token,
        service=service,
    )

    try:
        return service.update_draft(
            draft=draft,
            data=data,
        )
    except PersonalizationValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc
