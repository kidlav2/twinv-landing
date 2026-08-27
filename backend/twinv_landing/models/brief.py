from datetime import UTC, datetime
from enum import StrEnum
from uuid import uuid4

from sqlalchemy import DateTime, String, Text
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column

from twinv_landing.db import Base


def _str_enum(enum_cls: type[StrEnum], *, length: int = 32) -> SAEnum:
    return SAEnum(
        enum_cls,
        native_enum=False,
        values_callable=lambda members: [member.value for member in members],
        length=length,
    )


class BriefGoal(StrEnum):
    """Must match `BriefGoal` in frontend/lib/brief.ts."""

    NEW_SITE = "new-site"
    REDESIGN = "redesign"
    AUDIT = "audit"
    DEMO = "demo"


class BriefBudget(StrEnum):
    """Must match `BriefBudget` in frontend/lib/brief.ts."""

    UNDER_700 = "under-700"
    FROM_700_TO_1K = "700-1k"
    FROM_1K_TO_1_5K = "1k-1.5k"
    FROM_1_5K_TO_2_5K = "1.5k-2.5k"
    FROM_2_5K_TO_4K = "2.5k-4k"
    FROM_4K_TO_6K = "4k-6k"
    FROM_6K_PLUS = "6k-plus"
    UNDER_1K = "under-1k"
    AUDIT_FREE = "audit-free"
    FROM_300_TO_500 = "300-500"
    FROM_500_TO_1K = "500-1k"
    FROM_1K_TO_2K = "1k-2k"
    FROM_2K_PLUS = "2k-plus"


BUDGETS_BY_GOAL: dict[BriefGoal, frozenset[BriefBudget]] = {
    BriefGoal.NEW_SITE: frozenset(
        {
            BriefBudget.UNDER_700,
            BriefBudget.FROM_700_TO_1K,
            BriefBudget.FROM_1K_TO_1_5K,
            BriefBudget.FROM_1_5K_TO_2_5K,
            BriefBudget.FROM_2_5K_TO_4K,
            BriefBudget.FROM_4K_TO_6K,
            BriefBudget.FROM_6K_PLUS,
        }
    ),
    BriefGoal.REDESIGN: frozenset(
        {
            BriefBudget.UNDER_1K,
            BriefBudget.FROM_1K_TO_1_5K,
            BriefBudget.FROM_1_5K_TO_2_5K,
            BriefBudget.FROM_2_5K_TO_4K,
            BriefBudget.FROM_4K_TO_6K,
            BriefBudget.FROM_6K_PLUS,
        }
    ),
    BriefGoal.AUDIT: frozenset(
        {
            BriefBudget.AUDIT_FREE,
            BriefBudget.FROM_300_TO_500,
            BriefBudget.FROM_500_TO_1K,
            BriefBudget.FROM_1K_TO_2K,
            BriefBudget.FROM_2K_PLUS,
        }
    ),
    BriefGoal.DEMO: frozenset(),
}


class BriefSource(StrEnum):
    """Must match `BriefSource` in frontend/lib/brief.ts."""

    FRIEND = "friend"
    INSTAGRAM = "instagram"
    GOOGLE = "google"
    LINKEDIN = "linkedin"
    OTHER = "other"


class Brief(Base):
    """A brief submitted from the site form."""

    __tablename__ = "briefs"

    brief_id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid4())
    )
    goal: Mapped[BriefGoal] = mapped_column(_str_enum(BriefGoal), nullable=False)
    site: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(320), nullable=False)
    phone: Mapped[str] = mapped_column(String(32), nullable=False)
    budget: Mapped[BriefBudget | None] = mapped_column(
        _str_enum(BriefBudget), nullable=True
    )
    source: Mapped[BriefSource] = mapped_column(
        _str_enum(BriefSource), nullable=False
    )
    source_other: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )

    def __str__(self) -> str:
        return f"{self.name} <{self.email}> — {self.goal.value}"
