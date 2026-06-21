import logging
import itertools
import os
from pydantic_settings import BaseSettings, SettingsConfigDict

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("scoop")

class Settings(BaseSettings):
    gemini_api_key_1: str = ""
    gemini_api_key_2: str = ""
    gemini_api_key_3: str = ""
    gemini_api_key_4: str = ""
    gemini_api_key_5: str = ""
    gemini_api_key_6: str = ""
    gemini_api_key_7: str = ""
    fast_model: str = "gemini-3.1-flash-lite"
    reasoning_model: str = "gemini-3.1-flash-lite"
    database_url: str = "sqlite:///./scoop.db"
    max_retries: int = 3
    retry_delay: float = 1.0

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    def active_gemini_keys(self) -> list[str]:
        candidates = [
            self.gemini_api_key_1,
            self.gemini_api_key_2,
            self.gemini_api_key_3,
            self.gemini_api_key_4,
            self.gemini_api_key_5,
            self.gemini_api_key_6,
            self.gemini_api_key_7,
        ]
        return [k for k in candidates if k]

settings = Settings()

_active_keys = settings.active_gemini_keys()
if not _active_keys:
    logger.warning("No GEMINI_API_KEY_* keys are set. API calls will fail.")

_key_cycle = itertools.cycle(_active_keys) if _active_keys else itertools.cycle([""])

def next_gemini_key() -> str:
    return next(_key_cycle)
