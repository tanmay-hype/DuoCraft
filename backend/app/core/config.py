from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "DuoCraft API"
    environment: str = "development"
    debug: bool = False

    frontend_origin: str = "http://localhost:3000"

    database_url: str = "postgresql+psycopg://gift_user:gift_password@postgres:5432/duocraft"

    redis_url: str = "redis://redis:6379/0"

    admin_api_key: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    draft_lifetime_days: int = 7
    draft_cookie_name: str = "duocraft_draft_owner"
    draft_cookie_secure: bool = False

    s3_bucket_name: str = "duocraft-dev"
    s3_region: str = "ap-south-1"
    s3_access_key_id: str = ""
    s3_secret_access_key: str = ""
    s3_endpoint_url: str | None = None
    s3_public_endpoint_url: str | None = None

    photo_upload_max_bytes: int = 10 * 1024 * 1024
    photo_upload_url_expiry_seconds: int = 900
    photo_view_url_expiry_seconds: int = 900


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
