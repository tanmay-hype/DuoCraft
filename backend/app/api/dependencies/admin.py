import secrets
from typing import Annotated

from fastapi import Header, HTTPException, status

from app.core.config import settings


def require_admin(
    x_admin_key: Annotated[str | None, Header()] = None,
) -> None:
    if not settings.admin_api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Admin API is not configured.",
        )

    if x_admin_key is None or not secrets.compare_digest(
        x_admin_key,
        settings.admin_api_key,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials.",
        )
