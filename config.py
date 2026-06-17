import logging
import os
from pydantic_settings import BaseSettings, SettingsConfigDict

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("scoop")

class Settings(BaseSettings):
    gemini_api_key: str = ""
    fast_model: str = "gemini-1.5-flash"
    reasoning_model: str = "gemma-2-27b-it"
    database_url: str = "sqlite:///./scoop.db"
    max_retries: int = 3
    retry_delay: float = 1.0

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()

if not settings.gemini_api_key:
    logger.warning("GEMINI_API_KEY is not set. API calls will fail.")
