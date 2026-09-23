from uuid import UUID

from pydantic import BaseModel


class PublicGiftProduct(BaseModel):
    name: str
    slug: str
    template_key: str


class PublicGiftPhoto(BaseModel):
    asset_id: UUID
    view_url: str
    expires_in_seconds: int


class PublicGiftResponse(BaseModel):
    gift_id: UUID
    status: str
    product: PublicGiftProduct
    personalization: dict
    theme_key: str
    photos: list[PublicGiftPhoto]
