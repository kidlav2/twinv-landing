/** Round to currency minor units (cents). All ledger math goes through here. */
export function round2(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function pct(amount: number, percent: number): number {
  return round2(amount * (percent / 100));
}

export function clampPct(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(100, Math.max(0, n));
}

export function toSettlement(
  amount: number,
  from: string,
  settlement: string,
  fxRate: number | null,
): number {
  if (from === settlement) return round2(amount);
  if (fxRate && fxRate > 0) return round2(amount * fxRate);
  return round2(amount);
}
