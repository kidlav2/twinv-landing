import base64
from datetime import UTC, datetime
from email import message_from_bytes
from email.header import decode_header, make_header

import httpx
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from twinv_landing.db import Base
from twinv_landing.dto.brief_dto import BriefCreateDTO, BriefDTO
from twinv_landing.service.brief_service import BriefService
from twinv_landing.service.mail_service import GmailMailService

BRIEF = BriefDTO(
    brief_id="abc",
    goal="audit",
    site="example.com",
    message="Traffic dropped after the last redesign",
    name="Ada",
    email="ada@example.com",
    created_at=datetime(2026, 8, 25, tzinfo=UTC),
)


def make_mailer() -> GmailMailService:
    return GmailMailService(
        client_id="id",
        client_secret="secret",
        refresh_token="refresh",
        mail_to=["owner@gmail.com", "partner@gmail.com"],
    )


def test_build_message_carries_the_brief():
    raw = make_mailer()._build_message(BRIEF)
    message = message_from_bytes(base64.urlsafe_b64decode(raw))

    assert message["To"] == "owner@gmail.com, partner@gmail.com"
    assert message["Reply-To"] == "ada@example.com"
    assert str(make_header(decode_header(message["Subject"]))) == "Brief: audit — Ada"
    body = message.get_payload()
    assert "example.com" in body
    assert "Traffic dropped after the last redesign" in body
    assert "brief_id: abc" in body


def test_send_brief_swallows_gmail_failures(monkeypatch: pytest.MonkeyPatch):
    def refuse(*args: object, **kwargs: object) -> httpx.Response:
        raise httpx.ConnectError("gmail is down")

    monkeypatch.setattr(httpx, "post", refuse)
    assert make_mailer().send_brief(BRIEF) is False


def test_create_saves_brief_even_when_mail_fails(monkeypatch: pytest.MonkeyPatch):
    def refuse(*args: object, **kwargs: object) -> httpx.Response:
        raise httpx.ConnectError("gmail is down")

    monkeypatch.setattr(httpx, "post", refuse)

    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    dto = BriefCreateDTO(
        goal="demo",
        message="Book a walkthrough",
        name="Ada",
        email="ada@example.com",
    )

    with Session(engine) as session:
        created = BriefService(session, make_mailer()).create(dto)
        assert created.brief_id


def test_create_sends_mail_after_save():
    sent: list[BriefDTO] = []

    class RecordingMailer:
        def send_brief(self, brief: BriefDTO) -> bool:
            sent.append(brief)
            return True

    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    dto = BriefCreateDTO(
        goal="new-site",
        site="vandv.studio",
        message="Need a new marketing site",
        name="Ada",
        email="ada@example.com",
    )

    with Session(engine) as session:
        created = BriefService(session, RecordingMailer()).create(dto)

    assert len(sent) == 1
    assert sent[0].brief_id == created.brief_id
    assert sent[0].email == "ada@example.com"
