import pytest
from pydantic import ValidationError

from twinv_landing.dto.brief_dto import BriefCreateDTO
from twinv_landing.models.brief import BriefGoal


def test_form_goals_match_frontend_brief_goal():
    assert {goal.value for goal in BriefGoal} == {
        "new-site",
        "redesign",
        "audit",
        "demo",
    }


@pytest.mark.parametrize("goal", ["new-site", "redesign", "audit", "demo"])
def test_accepts_each_form_goal(goal: str):
    dto = BriefCreateDTO(
        goal=goal,
        message="A sentence or two is plenty.",
        name="Ada",
        email="ada@example.com",
    )
    assert dto.goal.value == goal


def test_blank_site_becomes_none():
    dto = BriefCreateDTO(
        goal="demo",
        site="   ",
        message="Book a walkthrough",
        name="Ada",
        email="ada@example.com",
    )
    assert dto.site is None


def test_strips_whitespace():
    dto = BriefCreateDTO(
        goal="audit",
        site="  example.com  ",
        message="  Traffic dropped  ",
        name="  Ada  ",
        email="  ada@example.com  ",
    )
    assert dto.site == "example.com"
    assert dto.message == "Traffic dropped"
    assert dto.name == "Ada"
    assert dto.email == "ada@example.com"


@pytest.mark.parametrize(
    "field,value",
    [
        ("message", ""),
        ("name", "   "),
        ("email", "not-an-email"),
        ("email", "ada@"),
        ("goal", "rebrand"),
    ],
)
def test_rejects_invalid_form_fields(field: str, value: str):
    payload = {
        "goal": "new-site",
        "message": "Need a new marketing site",
        "name": "Ada",
        "email": "ada@example.com",
        field: value,
    }
    with pytest.raises(ValidationError):
        BriefCreateDTO.model_validate(payload)
