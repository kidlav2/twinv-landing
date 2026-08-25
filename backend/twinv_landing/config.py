from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_SQLITE_PATH = BACKEND_ROOT / "data" / "twinv.db"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="TWINV_",
        env_file=BACKEND_ROOT / ".env",
        extra="ignore",
    )

    database_url: str = f"sqlite:///{DEFAULT_SQLITE_PATH}"

    # Gmail API (OAuth). All four must be set for brief e-mails to go out;
    # otherwise mail is simply disabled and briefs are only stored in the DB.
    google_client_id: str | None = None
    google_client_secret: str | None = None
    google_refresh_token: str | None = None
    mail_to: str | None = None

    @property
    def mail_enabled(self) -> bool:
        return all(
            (
                self.google_client_id,
                self.google_client_secret,
                self.google_refresh_token,
                self.mail_to,
            )
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()
