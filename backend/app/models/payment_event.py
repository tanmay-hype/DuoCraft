from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import (
    JSON,
    DateTime,
    ForeignKey,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class PaymentEvent(Base):
    __tablename__ = "payment_events"

    __table_args__ = (
        UniqueConstraint(
            "provider",
            "event_id",
            name="uq_payment_events_provider_event",
        ),
    )

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )

    provider: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        index=True,
    )

    event_id: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    event_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )

    order_id: Mapped[UUID | None] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey(
            "orders.id",
            ondelete="SET NULL",
        ),
        nullable=True,
        index=True,
    )

    payload: Mapped[dict] = mapped_column(
        JSON,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
