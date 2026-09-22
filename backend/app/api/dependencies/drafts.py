from typing import Annotated
from uuid import UUID

from fastapi import Cookie, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.draft_security import owner_token_matches
from app.models.draft import Draft

DatabaseSession = Annotated[Session, Depends(get_db)]

DraftOwnerToken = Annotated[
    str | None,
    Cookie(alias=settings.draft_cookie_name),
]


def get_owned_draft(
    draft_id: UUID,
    db: DatabaseSession,
    owner_token: DraftOwnerToken = None,
) -> Draft:
    draft = db.get(Draft, draft_id)

    if draft is None:
        raise HTTPException(
            status_code=404,
            detail="Draft not found.",
        )

    if owner_token is None:
        raise HTTPException(
            status_code=403,
            detail="You do not have access to this draft.",
        )

    if not owner_token_matches(
        owner_token,
        draft.owner_token_hash,
    ):
        raise HTTPException(
            status_code=403,
            detail="You do not have access to this draft.",
        )

    return draft
