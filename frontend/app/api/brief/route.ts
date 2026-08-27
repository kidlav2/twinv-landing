import { isValidBrief } from "@/lib/brief";
import { readBriefMailConfig, sendBriefMail } from "@/lib/brief-mail";

/**
 * Same-origin intake: the browser posts here, this route either emails the
 * brief via Gmail (production on Vercel) or forwards to FastAPI (local).
 *
 * Body contract is `BriefPayload` in lib/brief.ts. Gmail is preferred when
 * TWINV_GOOGLE_* + TWINV_MAIL_TO are set, so Vercel does not need a second
 * Python host. BRIEF_FORWARD_URL remains the fallback — in `next dev` that
 * defaults to uvicorn on :8000.
 */

const DEFAULT_FORWARD_URL = "http://127.0.0.1:8000/api/brief";

const FORWARD_URL =
  process.env.BRIEF_FORWARD_URL ??
  (process.env.NODE_ENV === "development" ? DEFAULT_FORWARD_URL : undefined);


export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Malformed JSON" }, { status: 400 });
  }

  // Revalidated here rather than trusting the form: this route is a public
  // URL, and the form's checks are a courtesy to the person filling it in.
  if (!isValidBrief(body)) {
    return Response.json({ error: "Invalid brief" }, { status: 400 });
  }

  if (readBriefMailConfig()) {
    try {
      await sendBriefMail(body);
      return Response.json({ ok: true });
    } catch (err) {
      console.error(
        "brief mail failed:",
        err instanceof Error ? err.message : err,
      );
      return Response.json({ error: "Mail send failed" }, { status: 502 });
    }
  }

  if (!FORWARD_URL) {
    console.error(
      "brief mail not configured; missing",
      [
        !process.env.TWINV_GOOGLE_CLIENT_ID?.trim() && "TWINV_GOOGLE_CLIENT_ID",
        !process.env.TWINV_GOOGLE_CLIENT_SECRET?.trim() &&
          "TWINV_GOOGLE_CLIENT_SECRET",
        !process.env.TWINV_GOOGLE_REFRESH_TOKEN?.trim() &&
          "TWINV_GOOGLE_REFRESH_TOKEN",
        !process.env.TWINV_MAIL_TO?.trim() && "TWINV_MAIL_TO",
      ].filter(Boolean),
    );
    // 501, not 500: nothing is broken, the destination simply is not wired up
    // yet. The form surfaces this as its ordinary failure message.
    return Response.json(
      { error: "No brief destination configured" },
      { status: 501 },
    );
  }

  try {
    const upstream = await fetch(FORWARD_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!upstream.ok) {
      return Response.json(
        { error: "Upstream rejected the brief" },
        { status: 502 },
      );
    }
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Upstream unreachable" }, { status: 502 });
  }
}
