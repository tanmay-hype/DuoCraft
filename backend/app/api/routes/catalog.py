from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas import AddonResponse, ProductResponse
from app.services.catalog import CatalogService

router = APIRouter(
    tags=["catalog"],
)


@router.get(
    "/products",
    response_model=list[ProductResponse],
)
def get_products(
    db: Annotated[Session, Depends(get_db)],
    featured: Annotated[
        bool | None,
        Query(description=("Filter products by featured status.")),
    ] = None,
    category: Annotated[
        str | None,
        Query(
            min_length=1,
            max_length=50,
            description=("Filter products by category."),
        ),
    ] = None,
) -> list[ProductResponse]:
    service = CatalogService(db)

    return service.get_products(
        featured=featured,
        category=category,
    )


@router.get(
    "/products/{slug}",
    response_model=ProductResponse,
)
def get_product(
    slug: str,
    db: Annotated[Session, Depends(get_db)],
) -> ProductResponse:
    service = CatalogService(db)

    product = service.get_product_by_slug(slug)

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found.",
        )

    return product


@router.get(
    "/addons",
    response_model=list[AddonResponse],
)
def get_addons(
    db: Annotated[Session, Depends(get_db)],
) -> list[AddonResponse]:
    service = CatalogService(db)

    return service.get_addons()
