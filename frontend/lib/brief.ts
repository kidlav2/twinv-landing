/**
 * The brief form's wire contract.
 *
 * This file is the whole seam between the form's UX and whatever eventually
 * receives a submission. The component imports `submitBrief` and nothing else
 * about the network; swapping the transport means editing this file and
 * `app/api/brief/route.ts` (Gmail in lib/brief-mail.ts), and touching no markup.
 *
 * Deliberately imports nothing — a server route reads these types too.
 */

/** Must stay in sync with `brief.goals[].id` in lib/content.ts. */
export type BriefGoal = "new-site" | "redesign" | "audit" | "demo";

export type BriefPayload = {
  goal: BriefGoal;
  /** The company's current site. Optional — a new site may not have one. */
  site?: string;
  message: string;
  name: string;
  email: string;
};

export type BriefResult =
  { ok: true } | { ok: false; error: string; status?: number };

/** Same-origin on purpose: the browser never talks to the API directly, so no
 *  CORS negotiation and no backend origin baked into the client bundle. */
export const BRIEF_ENDPOINT = "/api/brief";

export function isEmail(value: string) {
  // Deliberately loose. Anything stricter rejects addresses that are legal,
  // and the only real test of an address is whether mail to it arrives.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export async function submitBrief(payload: BriefPayload): Promise<BriefResult> {
  try {
    const res = await fetch(BRIEF_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      return { ok: false, error: `Request failed`, status: res.status };
    }
    return { ok: true };
  } catch {
    // Offline, DNS, blocked — indistinguishable from here and identical to
    // the user, so they collapse into one message.
    return { ok: false, error: "Network unavailable" };
  }
}
