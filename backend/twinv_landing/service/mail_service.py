import base64
import logging
from email.message import EmailMessage

import httpx

from twinv_landing.config import get_settings
from twinv_landing.dto.brief_dto import BriefDTO

logger = logging.getLogger(__name__)

TOKEN_URL = "https://oauth2.googleapis.com/token"
GMAIL_SEND_URL = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send"


class GmailMailService:
    """Sends brief notifications through the Gmail API.

    Auth is OAuth, not a static key: the long-lived refresh token from the
    one-time consent (see scripts/get_google_refresh_token.py) is exchanged
    for a short-lived access token on every send. Failures are logged and
    swallowed — the brief is already committed to the DB by the time this
    runs, and a Gmail hiccup must not turn into a 500 for the form.
    """

    def __init__(
        self,
        *,
        client_id: str,
        client_secret: str,
        refresh_token: str,
        mail_to: str,
    ) -> None:
        self._client_id = client_id
        self._client_secret = client_secret
        self._refresh_token = refresh_token
        self._mail_to = mail_to

    def send_brief(self, brief: BriefDTO) -> bool:
        try:
            token = self._access_token()
            response = httpx.post(
                GMAIL_SEND_URL,
                headers={"Authorization": f"Bearer {token}"},
                json={"raw": self._build_message(brief)},
                timeout=10.0,
            )
            response.raise_for_status()
        except httpx.HTTPError:
            logger.exception("brief %s saved, but the Gmail send failed", brief.brief_id)
            return False
        return True

    def _access_token(self) -> str:
        response = httpx.post(
            TOKEN_URL,
            data={
                "client_id": self._client_id,
                "client_secret": self._client_secret,
                "refresh_token": self._refresh_token,
                "grant_type": "refresh_token",
            },
            timeout=10.0,
        )
        response.raise_for_status()
        return response.json()["access_token"]

    def _build_message(self, brief: BriefDTO) -> str:
        message = EmailMessage()
        message["To"] = self._mail_to
        message["Subject"] = f"Brief: {brief.goal.value} — {brief.name}"
        # Reply-To is the visitor, so hitting "Reply" in Gmail answers them
        # instead of mailing yourself.
        message["Reply-To"] = brief.email
        message.set_content(
            "\n".join(
                (
                    f"Goal:    {brief.goal.value}",
                    f"Site:    {brief.site or '—'}",
                    f"Name:    {brief.name}",
                    f"Email:   {brief.email}",
                    "",
                    "Message:",
                    brief.message,
                    "",
                    f"brief_id: {brief.brief_id}",
                    f"received: {brief.created_at.isoformat()}",
                )
            )
        )
        return base64.urlsafe_b64encode(message.as_bytes()).decode()


def get_mail_service() -> GmailMailService | None:
    settings = get_settings()
    if not settings.mail_enabled:
        return None
    return GmailMailService(
        client_id=settings.google_client_id,
        client_secret=settings.google_client_secret,
        refresh_token=settings.google_refresh_token,
        mail_to=settings.mail_to,
    )
