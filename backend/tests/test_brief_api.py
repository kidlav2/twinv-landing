from twinv_landing.models.brief import Brief, BriefBudget, BriefGoal, BriefSource

FORM_PAYLOAD = {
    "goal": "new-site",
    "site": "vandv.studio",
    "message": "Need a new marketing site",
    "name": "Ada Lovelace",
    "email": "ada@example.com",
    "phone": "+1 415 555 0100",
    "budget": "1.5k-2.5k",
    "source": "google",
}


def test_post_brief_returns_ok_and_persists_form_fields(client, session_factory):
    response = client.post("/api/brief", json=FORM_PAYLOAD)

    assert response.status_code == 200
    body = response.json()
    assert body["ok"] is True
    brief = body["brief"]
    assert brief["goal"] == FORM_PAYLOAD["goal"]
    assert brief["site"] == FORM_PAYLOAD["site"]
    assert brief["message"] == FORM_PAYLOAD["message"]
    assert brief["name"] == FORM_PAYLOAD["name"]
    assert brief["email"] == FORM_PAYLOAD["email"]
    assert brief["brief_id"]
    assert brief["created_at"]

    with session_factory() as session:
        row = session.get(Brief, brief["brief_id"])
        assert row is not None
        assert row.goal is BriefGoal.NEW_SITE
        assert row.site == "vandv.studio"
        assert row.message == "Need a new marketing site"
        assert row.name == "Ada Lovelace"
        assert row.email == "ada@example.com"
        assert row.phone == "+1 415 555 0100"
        assert row.budget is BriefBudget.FROM_1_5K_TO_2_5K
        assert row.source is BriefSource.GOOGLE
        assert row.source_other is None
        assert row.created_at is not None


def test_post_brief_without_site_stores_null(client, session_factory):
    payload = {
        "goal": "demo",
        "message": "Book a walkthrough",
        "name": "Ada",
        "email": "ada@example.com",
        "phone": "+1 415 555 0100",
        "source": "friend",
    }
    response = client.post("/api/brief", json=payload)
    assert response.status_code == 200
    brief_id = response.json()["brief"]["brief_id"]

    with session_factory() as session:
        row = session.get(Brief, brief_id)
        assert row is not None
        assert row.goal is BriefGoal.DEMO
        assert row.site is None
        assert row.message == "Book a walkthrough"


def test_health(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_post_brief_rejects_unknown_goal(client):
    payload = {**FORM_PAYLOAD, "goal": "rebrand"}
    response = client.post("/api/brief", json=payload)
    assert response.status_code == 422


def test_post_brief_rejects_invalid_email(client):
    payload = {**FORM_PAYLOAD, "email": "not-an-email"}
    response = client.post("/api/brief", json=payload)
    assert response.status_code == 422


def test_post_brief_rejects_empty_message(client):
    payload = {**FORM_PAYLOAD, "message": "  "}
    response = client.post("/api/brief", json=payload)
    assert response.status_code == 422


def test_post_brief_rejects_short_phone(client):
    payload = {**FORM_PAYLOAD, "phone": "123"}
    response = client.post("/api/brief", json=payload)
    assert response.status_code == 422


def test_post_brief_other_source_requires_detail(client):
    payload = {**FORM_PAYLOAD, "source": "other"}
    response = client.post("/api/brief", json=payload)
    assert response.status_code == 422


def test_post_brief_other_source_stores_detail(client, session_factory):
    payload = {**FORM_PAYLOAD, "source": "other", "sourceOther": "A talk in Berlin"}
    response = client.post("/api/brief", json=payload)
    assert response.status_code == 200
    brief_id = response.json()["brief"]["brief_id"]

    with session_factory() as session:
        row = session.get(Brief, brief_id)
        assert row is not None
        assert row.source is BriefSource.OTHER
        assert row.source_other == "A talk in Berlin"
