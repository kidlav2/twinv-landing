from collections.abc import Generator
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from twinv_landing.config import get_settings


class Base(DeclarativeBase):
    pass


def _ensure_sqlite_parent(url: str) -> None:
    if not url.startswith("sqlite:///"):
        return
    raw = url.removeprefix("sqlite:///")
    if raw.startswith(":memory:"):
        return
    Path(raw).parent.mkdir(parents=True, exist_ok=True)


_settings = get_settings()
_ensure_sqlite_parent(_settings.database_url)

_connect_args = {"check_same_thread": False} if _settings.database_url.startswith("sqlite") else {}
engine = create_engine(_settings.database_url, connect_args=_connect_args)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)


def init_db() -> None:
    from twinv_landing.models import brief as _brief  # noqa: F401

    Base.metadata.create_all(bind=engine)


def get_session() -> Generator[Session]:
    session = SessionLocal()
    try:
        yield session
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
