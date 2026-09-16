from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models import Addon, Product

PRODUCTS = [
    {
        "slug": "proposal",
        "name": "The Big Question",
        "category": "romance",
        "description": (
            "Turn one unforgettable question into a playful "
            "little moment made just for them."
        ),
        "base_price": 39900,
        "sale_price": 29900,
        "badge": "Most Romantic",
        "template_key": "proposal",
        "is_featured": True,
        "display_order": 1,
    },
    {
        "slug": "birthday",
        "name": "Birthday Glow",
        "category": "celebration",
        "description": (
            "A joyful birthday surprise filled with your words, "
            "memories, and a little digital confetti."
        ),
        "base_price": 29900,
        "sale_price": 19900,
        "badge": "Popular",
        "template_key": "birthday",
        "is_featured": True,
        "display_order": 2,
    },
    {
        "slug": "apology",
        "name": "Can We Start Again?",
        "category": "romance",
        "description": (
            "Say the difficult things with care in a thoughtful "
            "experience built around your own words."
        ),
        "base_price": 29900,
        "sale_price": 19900,
        "badge": None,
        "template_key": "apology",
        "is_featured": False,
        "display_order": 3,
    },
    {
        "slug": "anniversary",
        "name": "Still Us",
        "category": "romance",
        "description": (
            "Celebrate the chapters behind you and the ones you "
            "still cannot wait to write together."
        ),
        "base_price": 39900,
        "sale_price": 29900,
        "badge": "For Two",
        "template_key": "anniversary",
        "is_featured": True,
        "display_order": 4,
    },
    {
        "slug": "love-letter",
        "name": "Dear You",
        "category": "romance",
        "description": (
            "A digital love letter that unfolds slowly, like "
            "something they were always meant to find."
        ),
        "base_price": 34900,
        "sale_price": 24900,
        "badge": None,
        "template_key": "love_letter",
        "is_featured": False,
        "display_order": 5,
    },
    {
        "slug": "photo-puzzle",
        "name": "Piece by Piece",
        "category": "memories",
        "description": (
            "Hide a favorite memory inside an interactive photo puzzle they get to reveal."
        ),
        "base_price": 39900,
        "sale_price": 29900,
        "badge": "Interactive",
        "template_key": "photo_puzzle",
        "is_featured": False,
        "display_order": 6,
    },
    {
        "slug": "scrapbook",
        "name": "Little Book of Us",
        "category": "memories",
        "description": (
            "Gather the photos, tiny stories, and ordinary moments that somehow became everything."
        ),
        "base_price": 49900,
        "sale_price": 34900,
        "badge": "Keepsake",
        "template_key": "scrapbook",
        "is_featured": False,
        "display_order": 7,
    },
    {
        "slug": "thank-you",
        "name": "A Little Thank You",
        "category": "gratitude",
        "description": (
            "Make gratitude feel personal with a warm note designed to linger after it is opened."
        ),
        "base_price": 24900,
        "sale_price": 14900,
        "badge": None,
        "template_key": "thank_you",
        "is_featured": False,
        "display_order": 8,
    },
    {
        "slug": "friendship",
        "name": "Glad It's You",
        "category": "friendship",
        "description": (
            "A small celebration of inside jokes, shared chaos, and the friend who always gets it."
        ),
        "base_price": 29900,
        "sale_price": 19900,
        "badge": None,
        "template_key": "friendship",
        "is_featured": False,
        "display_order": 9,
    },
    {
        "slug": "mothers-day",
        "name": "For Mum, With Love",
        "category": "family",
        "description": (
            "A gentle collection of memories and words for someone "
            "who deserves more than a text message."
        ),
        "base_price": 34900,
        "sale_price": 24900,
        "badge": "Made With Love",
        "template_key": "mothers_day",
        "is_featured": False,
        "display_order": 10,
    },
]


ADDONS = [
    {
        "slug": "extra-photos",
        "name": "Extra Photos",
        "description": ("Add room for more favorite photos and shared memories."),
        "price": 4900,
        "display_order": 1,
    },
    {
        "slug": "premium-theme",
        "name": "Premium Theme",
        "description": ("Unlock an additional premium visual theme for the gift."),
        "price": 7900,
        "display_order": 2,
    },
]


def seed_products(db: Session) -> None:
    for data in PRODUCTS:
        product = db.scalar(
            select(Product).where(
                Product.slug == data["slug"],
            )
        )

        if product is None:
            db.add(
                Product(
                    **data,
                    is_active=True,
                )
            )
            continue

        for field, value in data.items():
            setattr(product, field, value)

        product.is_active = True


def seed_addons(db: Session) -> None:
    for data in ADDONS:
        addon = db.scalar(
            select(Addon).where(
                Addon.slug == data["slug"],
            )
        )

        if addon is None:
            db.add(
                Addon(
                    **data,
                    is_active=True,
                )
            )
            continue

        for field, value in data.items():
            setattr(addon, field, value)

        addon.is_active = True


def seed_catalog() -> None:
    with SessionLocal() as db:
        try:
            seed_products(db)
            seed_addons(db)
            db.commit()
        except Exception:
            db.rollback()
            raise


if __name__ == "__main__":
    seed_catalog()
    print("Catalog seeded successfully.")
