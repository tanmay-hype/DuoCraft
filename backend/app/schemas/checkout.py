from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class CheckoutOrderCreate(BaseModel):
    draft_id: UUID
    addon_ids: list[int] = Field(
        default_factory=list,
        max_length=10,
    )
    customer_email: EmailStr | None = None


class CheckoutProductSnapshot(BaseModel):
    id: int
    slug: str
    name: str
    template_key: str
    base_price: int
    sale_price: int
    charged_price: int


class CheckoutAddonSnapshot(BaseModel):
    id: int
    slug: str
    name: str
    price: int


class CheckoutPricingSnapshot(BaseModel):
    product: CheckoutProductSnapshot
    addons: list[CheckoutAddonSnapshot]


class CheckoutOrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    order_id: UUID
    draft_id: UUID
    status: str
    currency: str
    subtotal_amount: int
    addon_amount: int
    total_amount: int
    customer_email: str | None
    pricing_snapshot: CheckoutPricingSnapshot
