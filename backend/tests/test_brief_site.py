from uuid import uuid4

import httpx
import pytest
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from twinv_landing.config import get_settings
from twinv_landing.models.brief import Brief, BriefGoal

SITE_BRIEF_URL = "http://127.0.0.1:3000/api/brief"
BACKEND_HEALTH_URL = "http://127.0.0.1:8000/api/health"


def _dev_servers_up() -> bool:
    try:
        site = httpx.get("http://127.0.0.1:3000", timeout=2.0)
        api = httpx.get(BACKEND_HEALTH_URL, timeout=2.0)
    except httpx.HTTPError:
        return False
    return site.status_code == 200 and api.status_code == 200


@pytest.mark.skipif(
    not _dev_servers_up(), reason="frontend and backend dev servers are not running"
)
def test_site_form_payload_is_saved_to_sqlite():
    marker = f"autotest-{uuid4().hex}@example.com"
    payload = {
        "goal": "audit",
        "site": "example.com",
        "message": "Traffic dropped after the last redesign",
        "name": "Site Autotest",
        "email": marker,
        "phone": "+1 415 555 0100",
        "budget": "500-1k",
        "source": "google",
    }

    response = httpx.post(SITE_BRIEF_URL, json=payload, timeout=5.0)
    assert response.status_code == 200
    assert response.json() == {"ok": True}

    engine = create_engine(get_settings().database_url)
    with Session(engine) as session:
        row = session.scalars(select(Brief).where(Brief.email == marker)).one()
        assert row.goal is BriefGoal.AUDIT
        assert row.site == "example.com"
        assert row.message == "Traffic dropped after the last redesign"
        assert row.name == "Site Autotest"
        assert row.email == marker
        assert row.created_at is not None
