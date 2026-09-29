from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "DuoCraft API"
    environment: str = "development"
    debug: bool = False

    frontend_origin: str = "http://localhost:3000"

    database_url: str = "postgresql+psycopg://gift_user:gift_password@postgres:5432/duocraft"

    redis_url: str = "redis://redis:6379/0"
    notification_queue_name: str = "duocraft.notifications"
    notification_max_retries: int = 5
    notification_retry_delay_seconds: int = 60
    notification_email_backend: str = "console"
    notification_from_email: str = "hello@duocraft.local"
    smtp_host: str | None = None
    smtp_port: int = 587
    smtp_username: str | None = None
    smtp_password: str | None = None
    smtp_use_tls: bool = True
    twilio_account_sid: str | None = None
    twilio_auth_token: str | None = None
    twilio_whatsapp_from: str | None = None
    public_gift_rate_limit: int = 60
    public_gift_rate_window_seconds: int = 60
    llm_enabled: bool = False
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"
    gemini_base_url: str = "https://generativelanguage.googleapis.com/v1beta"
    ollama_base_url: str = "http://ollama:11434"
    ollama_model: str = "llama3.1:8b"
    llm_timeout_seconds: float = 30.0
    llm_max_requests_per_window: int = 5
    llm_rate_limit_window_seconds: int = 3600
    llm_max_context_characters: int = 1200
    llm_max_output_characters: int = 8000

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

    razorpay_key_id: str = ""
    razorpay_key_secret: str = ""
    razorpay_currency: str = "INR"
    razorpay_timeout_seconds: float = 10.0
    razorpay_webhook_secret: str = ""

    gift_token_secret: str = ""
    gift_lifetime_days: int = 365


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
