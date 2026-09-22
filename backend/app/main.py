from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.admin_catalog import (
    router as admin_catalog_router,
)
from app.api.routes.catalog import router as catalog_router
from app.api.routes.checkout import router as checkout_router
from app.api.routes.drafts import router as drafts_router
from app.api.routes.health import router as health_router
from app.api.routes.payments import router as payments_router
from app.api.routes.photos import router as photos_router
from app.core.config import settings


def create_app() -> FastAPI:
    application = FastAPI(
        title=settings.app_name,
        debug=settings.debug,
        version="0.1.0",
    )

    application.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.frontend_origin],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    application.include_router(health_router)
    application.include_router(catalog_router)
    application.include_router(admin_catalog_router)
    application.include_router(drafts_router)
    application.include_router(photos_router)
    application.include_router(checkout_router)
    application.include_router(payments_router)
    return application


app = create_app()
