from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Addon, Product


class CatalogService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_products(
        self,
        *,
        featured: bool | None = None,
        category: str | None = None,
    ) -> list[Product]:
        statement = (
            select(Product)
            .where(Product.is_active.is_(True))
            .order_by(
                Product.display_order,
                Product.id,
            )
        )

        if featured is not None:
            statement = statement.where(Product.is_featured.is_(featured))

        if category is not None:
            statement = statement.where(Product.category == category)

        return list(self.db.scalars(statement).all())

    def get_product_by_slug(
        self,
        slug: str,
    ) -> Product | None:
        statement = select(Product).where(
            Product.slug == slug,
            Product.is_active.is_(True),
        )

        return self.db.scalar(statement)

    def get_addons(self) -> list[Addon]:
        statement = (
            select(Addon)
            .where(Addon.is_active.is_(True))
            .order_by(
                Addon.display_order,
                Addon.id,
            )
        )

        return list(self.db.scalars(statement).all())
