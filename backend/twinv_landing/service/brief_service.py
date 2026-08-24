from typing import Annotated

from fastapi import Depends
from sqlalchemy.orm import Session

from twinv_landing.db import get_session
from twinv_landing.dto.brief import BriefCreateDTO, BriefDTO
from twinv_landing.mappers.brief import BriefMapper


class BriefService:
    def __init__(self, session: Session) -> None:
        self._session = session

    def create(self, dto: BriefCreateDTO) -> BriefDTO:
        brief = BriefMapper.to_model(dto)
        self._session.add(brief)
        self._session.commit()
        self._session.refresh(brief)
        return BriefMapper.to_dto(brief)


def get_brief_service(
    session: Annotated[Session, Depends(get_session)],
) -> BriefService:
    return BriefService(session)
