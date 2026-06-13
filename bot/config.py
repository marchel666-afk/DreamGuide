from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    BOT_TOKEN: str
    DATABASE_URL: str
    OPENROUTER_API_KEY: str
    YOOKASSA_SHOP_ID: str = ""
    YOOKASSA_SECRET_KEY: str = ""
    WEBAPP_URL: str = "https://example.com"
    API_BASE_URL: str = "http://localhost:8000"
    FREE_INTERPRETATIONS_PER_DAY: int = 3

    PRICES: dict = {
        "deep_interpret": 10,
        "nightmare": 15,
        "pdf_export": 25,
        "secret_symbol": 5,
        "no_ads_week": 12,
        "premium_month": 49,
    }


settings = Settings()
