/**
 * Parse a duration into decimal hours.
 * 35m → 0.583h · 1h 20m → 1.333h · 1:20 → 1.333h · 1.5 → 1.5h
 */
export function parseDuration(input: string): number | null {
  const s = input.trim().toLowerCase().replace(/,/g, ".");
  if (!s) return null;

  if (/^\d+(\.\d+)?$/.test(s)) {
    const n = Number(s);
    return n >= 0 ? n : null;
  }

  const clock = s.match(/^(\d+):([0-5]?\d)$/);
  if (clock) {
    return Number(clock[1]) + Number(clock[2]) / 60;
  }

  let hours = 0;
  let matched = false;
  const h = s.match(/(\d+(?:\.\d+)?)\s*h/);
  const m = s.match(/(\d+(?:\.\d+)?)\s*m/);
  if (h) {
    hours += Number(h[1]);
    matched = true;
  }
  if (m) {
    hours += Number(m[1]) / 60;
    matched = true;
  }
  return matched && hours >= 0 ? hours : null;
}

export function formatHours(hours: number): string {
  if (!Number.isFinite(hours)) return "0h";
  const trimmed = hours.toFixed(3).replace(/\.?0+$/, "");
  return `${trimmed}h`;
}
