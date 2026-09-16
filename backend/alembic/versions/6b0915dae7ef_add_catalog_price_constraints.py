"""add catalog price constraints

Revision ID: 6b0915dae7ef
Revises: cbc5d06015d1
Create Date: 2026-09-16 11:44:01.964843
"""

from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "6b0915dae7ef"
down_revision: str | Sequence[str] | None = "cbc5d06015d1"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Add catalog price integrity constraints."""

    op.create_check_constraint(
        "ck_addons_price_non_negative",
        "addons",
        "price >= 0",
    )

    op.create_check_constraint(
        "ck_products_base_price_non_negative",
        "products",
        "base_price >= 0",
    )

    op.create_check_constraint(
        "ck_products_sale_price_non_negative",
        "products",
        "sale_price >= 0",
    )

    op.create_check_constraint(
        "ck_products_sale_price_lte_base_price",
        "products",
        "sale_price <= base_price",
    )


def downgrade() -> None:
    """Remove catalog price integrity constraints."""

    op.drop_constraint(
        "ck_products_sale_price_lte_base_price",
        "products",
        type_="check",
    )

    op.drop_constraint(
        "ck_products_sale_price_non_negative",
        "products",
        type_="check",
    )

    op.drop_constraint(
        "ck_products_base_price_non_negative",
        "products",
        type_="check",
    )

    op.drop_constraint(
        "ck_addons_price_non_negative",
        "addons",
        type_="check",
    )
