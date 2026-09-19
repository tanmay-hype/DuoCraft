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


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
