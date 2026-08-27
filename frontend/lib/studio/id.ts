export function nid(prefix = "id"): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function audit(
  actor: "a" | "b" | "system",
  action: string,
  detail: string,
) {
  return { id: nid("aud"), at: nowIso(), actor, action, detail };
}
