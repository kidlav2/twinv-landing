import re
from datetime import datetime
from typing import Literal, Self

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from twinv_landing.models.brief import (
    BUDGETS_BY_GOAL,
    BriefBudget,
    BriefGoal,
    BriefSource,
)

_EMAIL = re.compile(r"[^\s@]+@[^\s@]+\.[^\s@]+")


def _digit_count(value: str) -> int:
    return sum(ch.isdigit() for ch in value)


class BriefCreateDTO(BaseModel):
    """Inbound body from the site brief form (`BriefPayload`)."""

    model_config = ConfigDict(str_strip_whitespace=True, populate_by_name=True)

    goal: BriefGoal
    site: str | None = None
    message: str = Field(min_length=1)
    name: str = Field(min_length=1)
    email: str
    phone: str
    budget: BriefBudget | None = None
    source: BriefSource
    source_other: str | None = Field(default=None, alias="sourceOther")

    @field_validator("site", "source_other", mode="before")
    @classmethod
    def blank_to_none(cls, value: object) -> object:
        if isinstance(value, str) and not value.strip():
            return None
        return value

    @field_validator("email")
    @classmethod
    def email_shape(cls, value: str) -> str:
        if not _EMAIL.fullmatch(value):
            raise ValueError("invalid email")
        return value

    @field_validator("phone")
    @classmethod
    def phone_shape(cls, value: str) -> str:
        digits = _digit_count(value)
        if digits < 7 or digits > 15:
            raise ValueError("invalid phone")
        return value

    @model_validator(mode="after")
    def budget_matches_goal(self) -> Self:
        allowed = BUDGETS_BY_GOAL[self.goal]
        if self.goal is BriefGoal.DEMO:
            self.budget = None
            return self
        if self.budget is None or self.budget not in allowed:
            raise ValueError("budget does not match goal")
        return self

    @model_validator(mode="after")
    def other_source_needs_detail(self) -> Self:
        if self.source is BriefSource.OTHER and not self.source_other:
            raise ValueError("sourceOther is required when source is other")
        if self.source is not BriefSource.OTHER:
            self.source_other = None
        return self


class BriefDTO(BaseModel):
    """Persisted brief as returned by the API."""

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    brief_id: str
    goal: BriefGoal
    site: str | None
    message: str
    name: str
    email: str
    phone: str
    budget: BriefBudget | None
    source: BriefSource
    source_other: str | None = Field(default=None, alias="sourceOther")
    created_at: datetime


class BriefResponse(BaseModel):
    ok: Literal[True] = True
    brief: BriefDTO
