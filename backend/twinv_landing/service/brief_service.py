from typing import Annotated

from fastapi import Depends
from sqlalchemy.orm import Session

from twinv_landing.db import get_session
from twinv_landing.dto.brief_dto import BriefCreateDTO, BriefDTO
from twinv_landing.mappers.brief_mapper import BriefMapper
from twinv_landing.service.mail_service import GmailMailService, get_mail_service


class BriefService:
    def __init__(self, session: Session, mailer: GmailMailService | None = None) -> None:
        self._session = session
        self._mailer = mailer

    def create(self, dto: BriefCreateDTO) -> BriefDTO:
        brief = BriefMapper.to_model(dto)
        self._session.add(brief)
        self._session.commit()
        self._session.refresh(brief)
        result = BriefMapper.to_dto(brief)
        # Mail goes out only after the commit: a Gmail failure is logged
        # inside the mailer and never undoes or fails the saved brief.
        if self._mailer is not None:
            self._mailer.send_brief(result)
        return result


def get_brief_service(
    session: Annotated[Session, Depends(get_session)],
    mailer: Annotated[GmailMailService | None, Depends(get_mail_service)],
) -> BriefService:
    return BriefService(session, mailer)
