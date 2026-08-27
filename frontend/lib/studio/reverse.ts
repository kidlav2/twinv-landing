import { round2, pct } from "./money";

export interface ReverseInput {
  desiredA: number;
  desiredB: number;
  feePct: number;
  feeFixed: number;
  expenses: number;
  fxLoss: number;
  gstPct: number;
  taxMode: "inclusive" | "exclusive";
  salesPct: number;
  salesApplies: boolean;
  incomeTaxPct: number;
  studioReservePct: number;
}

export interface ReverseResult {
  requiredGross: number;
  impliedA: number;
  impliedB: number;
  pool: number;
  salesCredit: number;
  studioReserve: number;
  incomeTaxReserve: number;
  gstHst: number;
  fees: number;
  reachable: boolean;
  note: string;
}

/**
 * Invert the waterfall for a combined founder take-home.
 *
 * Sales credit is founder income, so:
 *   take-home = sales + project pool
 * GST exclusive does not inflate required gross (it sits on top).
 *
 * The resulting A/B split of that take-home still follows the contribution
 * ratios you pass as desiredA:desiredB for display — the price itself is
 * solved from the sum.
 */
export function requiredClientPrice(
  input: ReverseInput,
  splitA: number,
): ReverseResult {
  const T = round2(input.desiredA + input.desiredB);
  const f = input.feePct / 100;
  const g = input.taxMode === "inclusive" ? input.gstPct / 100 : 0;
  const s = input.salesApplies ? input.salesPct / 100 : 0;
  const t = input.incomeTaxPct / 100;
  const r = input.studioReservePct / 100;
  const alpha = (1 - t) * (1 - r);
  const k = input.feeFixed;
  const F = input.fxLoss;
  const E = input.expenses;

  // T = (1-α)*sales + α*afterTax
  // sales = s * (P(1-f) - k)
  // afterTax = P(1-f-g) - k - F - E
  const coeff = (1 - alpha) * s * (1 - f) + alpha * (1 - f - g);
  const constant = (1 - alpha) * s * -k + alpha * (-k - F - E);
  // T = coeff * P + constant  →  P = (T - constant) / coeff

  const reachable = coeff > 1e-9;
  const P = reachable ? round2((T - constant) / coeff) : 0;

  const fees = round2(pct(P, input.feePct) + k);
  const afterFees = round2(P - fees);
  const salesCredit = round2(afterFees * s);
  const gstHst = round2(P * (input.taxMode === "inclusive" ? g : input.gstPct / 100));
  const afterTax =
    input.taxMode === "inclusive"
      ? round2(afterFees - F - E - gstHst)
      : round2(afterFees - F - E);
  const afterSales = round2(afterTax - salesCredit);
  const incomeTaxReserve = round2(afterSales * t);
  const afterInc = round2(afterSales - incomeTaxReserve);
  const studioReserve = round2(afterInc * r);
  const pool = round2(afterInc - studioReserve);

  const a = Math.min(1, Math.max(0, splitA));
  const impliedA = round2(salesCredit + pool * a);
  const impliedB = round2(pool * (1 - a));

  return {
    requiredGross: P,
    impliedA,
    impliedB,
    pool,
    salesCredit,
    studioReserve,
    incomeTaxReserve,
    gstHst,
    fees,
    reachable,
    note: reachable
      ? "Solved from combined founder take-home through the same waterfall the ledger uses."
      : "These reserve and fee rates leave no room for a client price. Lower a percentage.",
  };
}
