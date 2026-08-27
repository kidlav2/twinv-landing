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

/** Must stay in sync with `brief.fields.budget.byGoal` in lib/content.ts. */
export type BriefBudget =
  | "under-700"
  | "700-1k"
  | "1k-1.5k"
  | "1.5k-2.5k"
  | "2.5k-4k"
  | "4k-6k"
  | "6k-plus"
  | "under-1k"
  | "audit-free"
  | "300-500"
  | "500-1k"
  | "1k-2k"
  | "2k-plus";

/** Must stay in sync with `brief.fields.source.options[].id`. */
export type BriefSource =
  | "friend"
  | "instagram"
  | "google"
  | "linkedin"
  | "other";

export const BRIEF_GOALS: readonly BriefGoal[] = [
  "new-site",
  "redesign",
  "audit",
  "demo",
];
export const BRIEF_BUDGETS_BY_GOAL: {
  readonly [K in Exclude<BriefGoal, "demo">]: readonly BriefBudget[];
} = {
  "new-site": [
    "under-700",
    "700-1k",
    "1k-1.5k",
    "1.5k-2.5k",
    "2.5k-4k",
    "4k-6k",
    "6k-plus",
  ],
  redesign: [
    "under-1k",
    "1k-1.5k",
    "1.5k-2.5k",
    "2.5k-4k",
    "4k-6k",
    "6k-plus",
  ],
  audit: ["audit-free", "300-500", "500-1k", "1k-2k", "2k-plus"],
};

export const BRIEF_BUDGETS: readonly BriefBudget[] = [
  ...new Set(Object.values(BRIEF_BUDGETS_BY_GOAL).flat()),
];
export const BRIEF_SOURCES: readonly BriefSource[] = [
  "friend",
  "instagram",
  "google",
  "linkedin",
  "other",
];

export type BriefPayload = {
  goal: BriefGoal;
  /** The company's current site. Optional — a new site may not have one. */
  site?: string;
  message: string;
  name: string;
  email: string;
  phone: string;
  /** Omitted for a demo — there is no budget to pick. */
  budget?: BriefBudget;
  source: BriefSource;
  /** Only sent when `source` is `other`. */
  sourceOther?: string;
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

export function isPhone(value: string) {
  // Count digits only: spaces, dashes, and a leading + are formatting.
  // 7–15 is the ITU range for a national number through E.164.
  const digits = value.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

function isOneOf<T extends string>(
  value: unknown,
  allowed: readonly T[],
): value is T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value);
}

/**
 * The route revalidates with this rather than trusting the form: `/api/brief`
 * is a public URL, and the form's checks are a courtesy to the person filling
 * it in.
 */
export function isValidBrief(body: unknown): body is BriefPayload {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Record<string, unknown>;
  if (!isOneOf(b.goal, BRIEF_GOALS)) return false;
  if (typeof b.message !== "string" || !b.message.trim()) return false;
  if (typeof b.name !== "string" || !b.name.trim()) return false;
  if (typeof b.email !== "string" || !b.email.includes("@")) return false;
  if (typeof b.phone !== "string" || !isPhone(b.phone)) return false;
  if (b.goal !== "demo") {
    if (
      !isOneOf(
        b.budget,
        BRIEF_BUDGETS_BY_GOAL[b.goal as Exclude<BriefGoal, "demo">],
      )
    ) {
      return false;
    }
  }
  if (!isOneOf(b.source, BRIEF_SOURCES)) return false;
  if (b.site !== undefined && typeof b.site !== "string") return false;
  if (b.source === "other") {
    return typeof b.sourceOther === "string" && b.sourceOther.trim().length > 0;
  }
  return b.sourceOther === undefined || typeof b.sourceOther === "string";
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
