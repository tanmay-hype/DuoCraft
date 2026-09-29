from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Cookie, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.routes.drafts import require_owned_draft
from app.core.config import settings
from app.core.database import get_db
from app.core.rate_limit import enforce_love_letter_rate_limit
from app.schemas.love_letter import (
    LoveLetterGenerateRequest,
    LoveLetterGenerateResponse,
)
from app.services.draft import DraftService
from app.services.love_letter import (
    LoveLetterGenerationError,
    LoveLetterSafetyError,
    generate_love_letter,
)

router = APIRouter(
    prefix="/drafts",
    tags=["love-letter"],
)


@router.post(
    "/{draft_id}/love-letter/generate",
    response_model=LoveLetterGenerateResponse,
)
def generate_love_letter_for_draft(
    draft_id: UUID,
    data: LoveLetterGenerateRequest,
    db: Annotated[Session, Depends(get_db)],
    owner_token: Annotated[
        str | None,
        Cookie(alias=settings.draft_cookie_name),
    ] = None,
) -> LoveLetterGenerateResponse:
    draft = require_owned_draft(
        draft_id=draft_id,
        owner_token=owner_token,
        service=DraftService(db),
    )

    if draft.template_key != "love_letter":
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Love Letter generation is only available for Love Letter drafts.",
        )

    remaining_requests = enforce_love_letter_rate_limit(draft.id)

    try:
        generated = generate_love_letter(data)
    except LoveLetterSafetyError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc
    except LoveLetterGenerationError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc

    return LoveLetterGenerateResponse(
        headline=generated.headline,
        message=generated.message,
        model=generated.model,
        provider=generated.provider,
        remaining_requests=remaining_requests,
    )