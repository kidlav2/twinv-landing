from twinv_landing.models.brief import Brief, BriefGoal

FORM_PAYLOAD = {
    "goal": "new-site",
    "site": "vandv.studio",
    "message": "Need a new marketing site",
    "name": "Ada Lovelace",
    "email": "ada@example.com",
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
        assert row.created_at is not None


def test_post_brief_without_site_stores_null(client, session_factory):
    payload = {
        "goal": "demo",
        "message": "Book a walkthrough",
        "name": "Ada",
        "email": "ada@example.com",
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
