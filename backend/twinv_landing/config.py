from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_SQLITE_PATH = BACKEND_ROOT / "data" / "twinv.db"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="TWINV_", extra="ignore")

    database_url: str = f"sqlite:///{DEFAULT_SQLITE_PATH}"


@lru_cache
def get_settings() -> Settings:
    return Settings()
