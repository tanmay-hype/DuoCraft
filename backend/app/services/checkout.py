from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Addon, Draft, Order, Product


class CheckoutValidationError(Exception):
    """Raised when checkout data cannot be fulfilled."""


class CheckoutService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create_order(
        self,
        *,
        draft: Draft,
        addon_ids: list[int],
        customer_email: str | None,
    ) -> Order:
        product = self.db.get(Product, draft.product_id)

        if product is None or not product.is_active:
            raise CheckoutValidationError("The product is no longer available.")

        unique_addon_ids = list(dict.fromkeys(addon_ids))

        addons: list[Addon] = []

        if unique_addon_ids:
            statement = (
                select(Addon)
                .where(
                    Addon.id.in_(unique_addon_ids),
                    Addon.is_active.is_(True),
                )
                .order_by(Addon.id)
            )

            addons = list(self.db.scalars(statement).all())

            found_ids = {addon.id for addon in addons}
            missing_ids = set(unique_addon_ids) - found_ids

            if missing_ids:
                raise CheckoutValidationError("One or more selected add-ons are unavailable.")

        charged_price = product.sale_price

        subtotal_amount = charged_price

        addon_amount = sum(addon.price for addon in addons)

        total_amount = subtotal_amount + addon_amount

        pricing_snapshot = {
            "product": {
                "id": product.id,
                "slug": product.slug,
                "name": product.name,
                "template_key": product.template_key,
                "base_price": product.base_price,
                "sale_price": product.sale_price,
                "charged_price": charged_price,
            },
            "addons": [
                {
                    "id": addon.id,
                    "slug": addon.slug,
                    "name": addon.name,
                    "price": addon.price,
                }
                for addon in addons
            ],
        }

        order = Order(
            draft_id=draft.id,
            status="pending",
            currency="INR",
            customer_email=(str(customer_email) if customer_email else None),
            subtotal_amount=subtotal_amount,
            addon_amount=addon_amount,
            total_amount=total_amount,
            pricing_snapshot=pricing_snapshot,
        )

        try:
            self.db.add(order)
            self.db.commit()
            self.db.refresh(order)
        except Exception:
            self.db.rollback()
            raise

        return order
