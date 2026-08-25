from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from twinv_landing.db import Base
from twinv_landing.dto.brief_dto import BriefCreateDTO
from twinv_landing.models.brief import Brief, BriefGoal
from twinv_landing.service.brief_service import BriefService


def test_brief_service_persists_to_sqlite():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)

    dto = BriefCreateDTO(
        goal="audit",
        site="example.com",
        message="Traffic dropped after the last redesign",
        name="Ada",
        email="ada@example.com",
    )

    with Session(engine) as session:
        created = BriefService(session).create(dto)
        brief_id = created.brief_id

    with Session(engine) as session:
        loaded = session.get(Brief, brief_id)
        assert loaded is not None
        assert loaded.goal is BriefGoal.AUDIT
        assert loaded.site == "example.com"
        assert loaded.message == "Traffic dropped after the last redesign"
        assert loaded.name == "Ada"
        assert loaded.email == "ada@example.com"
        assert loaded.created_at is not None
