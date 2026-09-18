from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Addon, Product
from app.schemas import AddonAdminUpdate, ProductAdminUpdate


class AdminCatalogService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_products(self) -> list[Product]:
        statement = select(Product).order_by(
            Product.display_order,
            Product.id,
        )

        return list(self.db.scalars(statement).all())

    def get_product_by_id(
        self,
        product_id: int,
    ) -> Product | None:
        return self.db.get(Product, product_id)

    def update_product(
        self,
        product: Product,
        data: ProductAdminUpdate,
    ) -> Product:
        updates = data.model_dump(exclude_unset=True)

        final_base_price = updates.get(
            "base_price",
            product.base_price,
        )
        final_sale_price = updates.get(
            "sale_price",
            product.sale_price,
        )

        if final_sale_price > final_base_price:
            raise ValueError("sale_price cannot exceed base_price")

        for field, value in updates.items():
            setattr(product, field, value)

        try:
            self.db.commit()
            self.db.refresh(product)
        except Exception:
            self.db.rollback()
            raise

        return product

    def get_addons(self) -> list[Addon]:
        statement = select(Addon).order_by(
            Addon.display_order,
            Addon.id,
        )

        return list(self.db.scalars(statement).all())

    def get_addon_by_id(
        self,
        addon_id: int,
    ) -> Addon | None:
        return self.db.get(Addon, addon_id)

    def update_addon(
        self,
        addon: Addon,
        data: AddonAdminUpdate,
    ) -> Addon:
        updates = data.model_dump(exclude_unset=True)

        for field, value in updates.items():
            setattr(addon, field, value)

        try:
            self.db.commit()
            self.db.refresh(addon)
        except Exception:
            self.db.rollback()
            raise

        return addon
