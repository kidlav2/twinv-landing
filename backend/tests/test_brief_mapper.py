from datetime import UTC, datetime

from twinv_landing.dto.brief import BriefCreateDTO
from twinv_landing.mappers.brief import BriefMapper
from twinv_landing.models.brief import BriefGoal


def test_brief_to_model_maps_form_fields():
    dto = BriefCreateDTO(
        goal="new-site",
        site="vandv.studio",
        message="Need a new marketing site",
        name="Ada",
        email="ada@example.com",
    )
    brief = BriefMapper.to_model(dto, brief_id="fixed-id")

    assert brief.brief_id == "fixed-id"
    assert brief.goal is BriefGoal.NEW_SITE
    assert brief.site == "vandv.studio"
    assert brief.message == "Need a new marketing site"
    assert brief.name == "Ada"
    assert brief.email == "ada@example.com"


def test_site_is_optional_and_blank_becomes_none():
    dto = BriefCreateDTO(
        goal="demo",
        site="",
        message="Book a walkthrough",
        name="Ada",
        email="ada@example.com",
    )
    brief = BriefMapper.to_model(dto)
    assert brief.goal is BriefGoal.DEMO
    assert brief.site is None


def test_brief_to_dto_round_trip():
    dto = BriefCreateDTO(
        goal="redesign",
        message="The current site is slow",
        name="Ada",
        email="ada@example.com",
    )
    brief = BriefMapper.to_model(dto, brief_id="abc")
    brief.created_at = datetime(2026, 8, 25, tzinfo=UTC)

    out = BriefMapper.to_dto(brief)
    assert out.brief_id == "abc"
    assert out.goal is BriefGoal.REDESIGN
    assert out.site is None
    assert out.message == "The current site is slow"
    assert out.name == "Ada"
    assert out.email == "ada@example.com"
