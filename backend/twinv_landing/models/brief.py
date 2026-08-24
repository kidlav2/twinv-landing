from datetime import UTC, datetime
from enum import StrEnum
from uuid import uuid4

from sqlalchemy import DateTime, String, Text
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column

from twinv_landing.db import Base


class BriefGoal(StrEnum):
    """Must match `BriefGoal` in frontend/lib/brief.ts."""

    NEW_SITE = "new-site"
    REDESIGN = "redesign"
    AUDIT = "audit"
    DEMO = "demo"


class Brief(Base):
    """A brief submitted from the site form."""

    __tablename__ = "briefs"

    brief_id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid4())
    )
    goal: Mapped[BriefGoal] = mapped_column(
        SAEnum(
            BriefGoal,
            native_enum=False,
            values_callable=lambda members: [member.value for member in members],
            length=32,
        ),
        nullable=False,
    )
    site: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(320), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )

    def __str__(self) -> str:
        return f"{self.name} <{self.email}> — {self.goal.value}"
