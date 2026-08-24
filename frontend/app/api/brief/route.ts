import type { BriefPayload } from "@/lib/brief";

/**
 * Receives a brief and hands it on.
 *
 * ─── For whoever owns the backend ───────────────────────────────────────────
 * This is a thin proxy, not a destination. It exists so the browser only ever
 * talks to its own origin: no CORS preflight, and no backend URL shipped in
 * the client bundle. Two ways to finish it:
 *
 *   1. Point `BRIEF_FORWARD_URL` at the FastAPI route and change nothing else.
 *      Example: BRIEF_FORWARD_URL=http://127.0.0.1:8000/api/brief
 *   2. Or replace the forward below with a direct write/send.
 *
 * The body is `BriefPayload` from lib/brief.ts — that type is the contract:
 *   { goal: "new-site" | "redesign" | "audit" | "demo",
 *     site?: string, message: string, name: string, email: string }
 *
 * Note the FastAPI app currently allows CORS for http://localhost:5173 only.
 * That does not matter while this proxy is in front of it (the call is
 * server-to-server), but it will matter the moment anything calls it from the
 * browser directly.
 * ────────────────────────────────────────────────────────────────────────────
 */

const FORWARD_URL = process.env.BRIEF_FORWARD_URL;

function isValid(body: unknown): body is BriefPayload {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Record<string, unknown>;
  const goals = ["new-site", "redesign", "audit", "demo"];
  return (
    typeof b.goal === "string" &&
    goals.includes(b.goal) &&
    typeof b.message === "string" &&
    b.message.trim().length > 0 &&
    typeof b.name === "string" &&
    b.name.trim().length > 0 &&
    typeof b.email === "string" &&
    b.email.includes("@") &&
    (b.site === undefined || typeof b.site === "string")
  );
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Malformed JSON" }, { status: 400 });
  }

  // Revalidated here rather than trusting the form: this route is a public
  // URL, and the form's checks are a courtesy to the person filling it in.
  if (!isValid(body)) {
    return Response.json({ error: "Invalid brief" }, { status: 400 });
  }

  if (!FORWARD_URL) {
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
