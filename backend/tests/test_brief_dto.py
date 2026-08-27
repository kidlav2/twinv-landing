import pytest
from pydantic import ValidationError

from twinv_landing.dto.brief_dto import BriefCreateDTO
from twinv_landing.models.brief import BriefBudget, BriefGoal, BriefSource

REQUIRED = {
    "message": "A sentence or two is plenty.",
    "name": "Ada",
    "email": "ada@example.com",
    "phone": "+1 415 555 0100",
    "budget": "1.5k-2.5k",
    "source": "google",
}


def test_form_goals_match_frontend_brief_goal():
    assert {goal.value for goal in BriefGoal} == {
        "new-site",
        "redesign",
        "audit",
        "demo",
    }


def test_form_budget_and_source_match_frontend():
    assert {item.value for item in BriefBudget} == {
        "under-700",
        "700-1k",
        "1k-1.5k",
        "1.5k-2.5k",
        "2.5k-4k",
        "4k-6k",
        "6k-plus",
        "under-1k",
        "audit-free",
        "300-500",
        "500-1k",
        "1k-2k",
        "2k-plus",
    }
    assert {item.value for item in BriefSource} == {
        "friend",
        "instagram",
        "google",
        "linkedin",
        "other",
    }


@pytest.mark.parametrize(
    "goal,budget",
    [
        ("new-site", "1.5k-2.5k"),
        ("redesign", "1.5k-2.5k"),
        ("audit", "500-1k"),
        ("demo", None),
    ],
)
def test_accepts_each_form_goal(goal: str, budget: str | None):
    payload = {k: v for k, v in REQUIRED.items() if k != "budget"}
    if budget is not None:
        payload["budget"] = budget
    dto = BriefCreateDTO(goal=goal, **payload)
    assert dto.goal.value == goal
    if goal == "demo":
        assert dto.budget is None


def test_demo_strips_a_budget():
    dto = BriefCreateDTO(goal="demo", **REQUIRED)
    assert dto.budget is None


def test_budget_must_match_goal():
    with pytest.raises(ValidationError):
        BriefCreateDTO(goal="audit", **REQUIRED)
    with pytest.raises(ValidationError):
        payload = {k: v for k, v in REQUIRED.items() if k != "budget"}
        BriefCreateDTO(goal="new-site", **payload)


def test_blank_site_becomes_none():
    dto = BriefCreateDTO(goal="demo", site="   ", **REQUIRED)
    assert dto.site is None


def test_strips_whitespace():
    dto = BriefCreateDTO(
        goal="audit",
        site="  example.com  ",
        message="  Traffic dropped  ",
        name="  Ada  ",
        email="  ada@example.com  ",
        phone="  +1 415 555 0100  ",
        budget="500-1k",
        source="google",
    )
    assert dto.site == "example.com"
    assert dto.message == "Traffic dropped"
    assert dto.name == "Ada"
    assert dto.email == "ada@example.com"
    assert dto.phone == "+1 415 555 0100"


def test_source_other_alias_and_required_detail():
    dto = BriefCreateDTO(
        goal="new-site",
        **{**REQUIRED, "source": "other", "sourceOther": "  A talk  "},
    )
    assert dto.source is BriefSource.OTHER
    assert dto.source_other == "A talk"


def test_source_other_without_detail_is_rejected():
    with pytest.raises(ValidationError):
        BriefCreateDTO(goal="new-site", **{**REQUIRED, "source": "other"})


@pytest.mark.parametrize(
    "field,value",
    [
        ("message", ""),
        ("name", "   "),
        ("email", "not-an-email"),
        ("email", "ada@"),
        ("goal", "rebrand"),
        ("phone", "123"),
        ("budget", "lots"),
        ("source", "billboard"),
    ],
)
def test_rejects_invalid_form_fields(field: str, value: str):
    payload = {
        "goal": "new-site",
        **REQUIRED,
        field: value,
    }
    with pytest.raises(ValidationError):
        BriefCreateDTO.model_validate(payload)
