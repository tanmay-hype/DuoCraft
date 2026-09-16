from datetime import datetime

from pydantic import BaseModel, ConfigDict


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
