from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, model_validator


class ProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    name: str
    category: str
    description: str

    base_price: int
    sale_price: int

    badge: str | None
    template_key: str

    is_featured: bool
    display_order: int

    created_at: datetime
    updated_at: datetime


class AddonResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    name: str
    description: str

    price: int

    display_order: int

    created_at: datetime
    updated_at: datetime


class ProductAdminUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=1,
        max_length=120,
    )
    category: str | None = Field(
        default=None,
        min_length=1,
        max_length=50,
    )
    description: str | None = Field(
        default=None,
        min_length=1,
        max_length=1000,
    )

    base_price: int | None = Field(
        default=None,
        ge=0,
    )
    sale_price: int | None = Field(
        default=None,
        ge=0,
    )

    badge: str | None = Field(
        default=None,
        max_length=80,
    )

    is_featured: bool | None = None
    is_active: bool | None = None

    display_order: int | None = Field(
        default=None,
        ge=0,
    )

    @model_validator(mode="after")
    def validate_prices(self) -> "ProductAdminUpdate":
        if (
            self.base_price is not None
            and self.sale_price is not None
            and self.sale_price > self.base_price
        ):
            raise ValueError("sale_price cannot exceed base_price")

        return self


class AddonAdminUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=1,
        max_length=120,
    )
    description: str | None = Field(
        default=None,
        min_length=1,
        max_length=1000,
    )
    price: int | None = Field(
        default=None,
        ge=0,
    )
    is_active: bool | None = None
    display_order: int | None = Field(
        default=None,
        ge=0,
    )


class ProductAdminResponse(ProductResponse):
    is_active: bool


class AddonAdminResponse(AddonResponse):
    is_active: bool
