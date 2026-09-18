from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies.admin import require_admin
from app.core.database import get_db
from app.schemas import (
    AddonAdminResponse,
    AddonAdminUpdate,
    ProductAdminResponse,
    ProductAdminUpdate,
)
from app.services.admin_catalog import AdminCatalogService

router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(require_admin)],
)


@router.get(
    "/products",
    response_model=list[ProductAdminResponse],
)
def get_admin_products(
    db: Annotated[Session, Depends(get_db)],
) -> list[ProductAdminResponse]:
    service = AdminCatalogService(db)

    return service.get_products()


@router.patch(
    "/products/{product_id}",
    response_model=ProductAdminResponse,
)
def update_admin_product(
    product_id: int,
    data: ProductAdminUpdate,
    db: Annotated[Session, Depends(get_db)],
) -> ProductAdminResponse:
    service = AdminCatalogService(db)

    product = service.get_product_by_id(product_id)

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found.",
        )

    try:
        return service.update_product(product, data)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc


@router.get(
    "/addons",
    response_model=list[AddonAdminResponse],
)
def get_admin_addons(
    db: Annotated[Session, Depends(get_db)],
) -> list[AddonAdminResponse]:
    service = AdminCatalogService(db)

    return service.get_addons()


@router.patch(
    "/addons/{addon_id}",
    response_model=AddonAdminResponse,
)
def update_admin_addon(
    addon_id: int,
    data: AddonAdminUpdate,
    db: Annotated[Session, Depends(get_db)],
) -> AddonAdminResponse:
    service = AdminCatalogService(db)

    addon = service.get_addon_by_id(addon_id)

    if addon is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Addon not found.",
        )

    return service.update_addon(addon, data)
