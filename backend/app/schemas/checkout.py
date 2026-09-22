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


class PaymentOrderResponse(BaseModel):
    order_id: UUID
    provider: str
    provider_order_id: str
    amount: int
    currency: str
    key_id: str


class PaymentVerificationRequest(BaseModel):
    razorpay_payment_id: str = Field(
        min_length=1,
        max_length=255,
    )
    razorpay_order_id: str = Field(
        min_length=1,
        max_length=255,
    )
    razorpay_signature: str = Field(
        min_length=1,
        max_length=255,
    )


class PaymentVerificationResponse(BaseModel):
    order_id: UUID
    status: str
    payment_id: str
