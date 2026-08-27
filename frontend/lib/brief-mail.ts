import type { BriefPayload } from "@/lib/brief";
import { brief } from "@/lib/content";

/**
 * Sends a brief via Gmail's API using the friend's TWINV_GOOGLE_* keys.
 *
 * Lives on the server only — imported by `app/api/brief/route.ts`. The browser
 * never sees these env vars. Same names as FastAPI's `TWINV_` prefix, so the
 * keys he already generated drop onto Vercel without renaming.
 *
 * A refresh token is not enough on its own: Google also needs the OAuth
 * client id that issued it (`TWINV_GOOGLE_CLIENT_ID`).
 */

type MailConfig = {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  to: string[];
};

function oneLine(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function encodeHeader(value: string) {
  const clean = oneLine(value);
  if (/^[\x20-\x7e]*$/.test(clean)) return clean;
  return `=?UTF-8?B?${Buffer.from(clean, "utf8").toString("base64")}?=`;
}

function parseRecipients(raw: string) {
  return raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function readBriefMailConfig(): MailConfig | null {
  const clientId = process.env.TWINV_GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.TWINV_GOOGLE_CLIENT_SECRET?.trim();
  const refreshToken = process.env.TWINV_GOOGLE_REFRESH_TOKEN?.trim();
  const to = parseRecipients(process.env.TWINV_MAIL_TO ?? "");

  if (!clientId || !clientSecret || !refreshToken || to.length === 0) {
    return null;
  }
  return { clientId, clientSecret, refreshToken, to };
}

function goalLabel(goal: BriefPayload["goal"]) {
  return brief.goals.find((g) => g.id === goal)?.label ?? goal;
}

function budgetLabel(id: NonNullable<BriefPayload["budget"]>) {
  const lists = Object.values(brief.fields.budget.byGoal);
  for (const options of lists) {
    const hit = options.find((o) => o.id === id);
    if (hit) return hit.label;
  }
  return id;
}

function sourceLabel(payload: BriefPayload) {
  const picked =
    brief.fields.source.options.find((o) => o.id === payload.source)?.label ??
    payload.source;
  if (payload.source === "other" && payload.sourceOther?.trim()) {
    return `${picked} — ${payload.sourceOther.trim()}`;
  }
  return picked;
}

function buildMime(payload: BriefPayload, to: string[]) {
  const site = payload.site?.trim() || "—";
  const subject = `Brief: ${goalLabel(payload.goal)} — ${payload.name}`;
  const lines = [
    `Goal:    ${goalLabel(payload.goal)}`,
    `Site:    ${site}`,
  ];
  if (payload.budget) {
    lines.push(`Budget:  ${budgetLabel(payload.budget)}`);
  }
  lines.push(
    `Name:    ${payload.name}`,
    `Email:   ${payload.email}`,
    `Phone:   ${payload.phone}`,
    `Heard:   ${sourceLabel(payload)}`,
    "",
    "Message:",
    payload.message,
  );
  const body = lines.join("\r\n");

  // No From: Gmail fills the authorised mailbox, same as the FastAPI sender.
  return [
    `To: ${to.join(", ")}`,
    `Reply-To: ${encodeHeader(payload.name)} <${oneLine(payload.email)}>`,
    `Subject: ${encodeHeader(subject)}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=utf-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    body,
  ].join("\r\n");
}

function toBase64Url(value: string) {
  return Buffer.from(value, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

async function accessToken(config: MailConfig): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: config.refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    const detail = await res.text().then((t) => t.slice(0, 300), () => "");
    throw new Error(`Google token refresh failed (${res.status}) ${detail}`);
  }
  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) {
    throw new Error("Google token refresh returned no access_token");
  }
  return data.access_token;
}

export async function sendBriefMail(payload: BriefPayload): Promise<void> {
  const config = readBriefMailConfig();
  if (!config) {
    throw new Error("Brief mail is not configured");
  }

  const token = await accessToken(config);
  const raw = toBase64Url(buildMime(payload, config.to));

  const res = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw }),
    },
  );
  if (!res.ok) {
    const detail = await res.text().then((t) => t.slice(0, 300), () => "");
    throw new Error(`Gmail send failed (${res.status}) ${detail}`);
  }
}
