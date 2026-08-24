import re
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

from twinv_landing.models.brief import BriefGoal

_EMAIL = re.compile(r"[^\s@]+@[^\s@]+\.[^\s@]+")


class BriefCreateDTO(BaseModel):
    """Inbound body from the site brief form (`BriefPayload`)."""

    model_config = ConfigDict(str_strip_whitespace=True)

    goal: BriefGoal
    site: str | None = None
    message: str = Field(min_length=1)
    name: str = Field(min_length=1)
    email: str

    @field_validator("site", mode="before")
    @classmethod
    def blank_site_to_none(cls, value: object) -> object:
        if isinstance(value, str) and not value.strip():
            return None
        return value

    @field_validator("email")
    @classmethod
    def email_shape(cls, value: str) -> str:
        if not _EMAIL.fullmatch(value):
            raise ValueError("invalid email")
        return value


class BriefDTO(BaseModel):
    """Persisted brief as returned by the API."""

    model_config = ConfigDict(from_attributes=True)

    brief_id: str
    goal: BriefGoal
    site: str | None
    message: str
    name: str
    email: str
    created_at: datetime


class BriefResponse(BaseModel):
    ok: Literal[True] = True
    brief: BriefDTO
