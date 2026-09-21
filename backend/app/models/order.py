from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import (
    JSON,
    BigInteger,
    CheckConstraint,
    DateTime,
    ForeignKey,
    String,
    func,
)
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )

    draft_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey(
            "drafts.id",
            ondelete="RESTRICT",
        ),
        nullable=False,
        index=True,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="pending",
        server_default="pending",
        index=True,
    )

    currency: Mapped[str] = mapped_column(
        String(3),
        nullable=False,
        default="INR",
        server_default="INR",
    )

    customer_email: Mapped[str | None] = mapped_column(
        String(320),
        nullable=True,
    )

    subtotal_amount: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
        default=0,
        server_default="0",
    )

    addon_amount: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
        default=0,
        server_default="0",
    )

    total_amount: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
        default=0,
        server_default="0",
    )

    pricing_snapshot: Mapped[dict] = mapped_column(
        JSON,
        nullable=False,
        default=dict,
    )

    payment_provider: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True,
    )

    provider_order_id: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    provider_payment_id: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    paid_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    __table_args__ = (
        CheckConstraint(
            "subtotal_amount >= 0",
            name="ck_orders_subtotal_nonnegative",
        ),
        CheckConstraint(
            "addon_amount >= 0",
            name="ck_orders_addon_nonnegative",
        ),
        CheckConstraint(
            "total_amount >= 0",
            name="ck_orders_total_nonnegative",
        ),
        CheckConstraint(
            "total_amount = subtotal_amount + addon_amount",
            name="ck_orders_total_matches_components",
        ),
        CheckConstraint(
            "status IN ('pending', 'payment_pending', 'paid', 'failed', 'cancelled')",
            name="ck_orders_status",
        ),
    )
