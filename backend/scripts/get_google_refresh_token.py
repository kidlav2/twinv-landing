"""One-time helper: obtain a Gmail refresh token for the brief mailer.

Prerequisites (Google Cloud console, https://console.cloud.google.com):
  1. Create a project, enable the Gmail API.
  2. OAuth consent screen: External, add your own Gmail as a test user.
  3. Credentials → Create credentials → OAuth client ID → "Desktop app".

Then run, from backend/:

    uv run python scripts/get_google_refresh_token.py

Paste the client id/secret when asked, approve in the browser, and copy the
printed TWINV_* lines into backend/.env. While the consent screen stays in
"Testing", Google expires the refresh token after 7 days — publish the app
to production for a permanent one.
"""

import http.server
import secrets
import threading
import urllib.parse
import webbrowser

import httpx

AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
TOKEN_URL = "https://oauth2.googleapis.com/token"
SCOPE = "https://www.googleapis.com/auth/gmail.send"
PORT = 8765
REDIRECT_URI = f"http://localhost:{PORT}/"


def wait_for_code(state: str) -> str:
    code_holder: dict[str, str] = {}
    done = threading.Event()

    class Handler(http.server.BaseHTTPRequestHandler):
        def do_GET(self) -> None:  # noqa: N802 - stdlib API name
            params = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
            ok = params.get("state", [""])[0] == state and "code" in params
            if ok:
                code_holder["code"] = params["code"][0]
            self.send_response(200 if ok else 400)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.end_headers()
            self.wfile.write(b"Done - you can close this tab." if ok else b"Bad OAuth redirect.")
            if ok:
                done.set()

        def log_message(self, *args: object) -> None:
            pass

    server = http.server.HTTPServer(("localhost", PORT), Handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    done.wait()
    server.shutdown()
    return code_holder["code"]


def main() -> None:
    client_id = input("OAuth client id: ").strip()
    client_secret = input("OAuth client secret: ").strip()
    mail_to = input("Send briefs to (your Gmail): ").strip()

    state = secrets.token_urlsafe(16)
    consent = (
        AUTH_URL
        + "?"
        + urllib.parse.urlencode(
            {
                "client_id": client_id,
                "redirect_uri": REDIRECT_URI,
                "response_type": "code",
                "scope": SCOPE,
                # Both are required to get a refresh token, not just an access token.
                "access_type": "offline",
                "prompt": "consent",
                "state": state,
            }
        )
    )
    print("\nOpening browser for consent…")
    webbrowser.open(consent)
    code = wait_for_code(state)

    response = httpx.post(
        TOKEN_URL,
        data={
            "client_id": client_id,
            "client_secret": client_secret,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": REDIRECT_URI,
        },
        timeout=10.0,
    )
    response.raise_for_status()
    refresh_token = response.json()["refresh_token"]

    print("\nAdd these lines to backend/.env:\n")
    print(f"TWINV_GOOGLE_CLIENT_ID={client_id}")
    print(f"TWINV_GOOGLE_CLIENT_SECRET={client_secret}")
    print(f"TWINV_GOOGLE_REFRESH_TOKEN={refresh_token}")
    print(f"TWINV_MAIL_TO={mail_to}")


if __name__ == "__main__":
    main()
