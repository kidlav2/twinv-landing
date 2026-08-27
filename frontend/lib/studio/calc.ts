import type {
  Acquisition,
  FounderId,
  Project,
  SplitMethod,
  WeightedScore,
  WeightCategoryId,
} from "./types";
import { round2, pct, toSettlement } from "./money";

export type StepKind =
  | "inflow"
  | "deduction"
  | "reserve"
  | "credit"
  | "pool"
  | "payout"
  | "sidecar";

export interface WaterfallStep {
  id: string;
  label: string;
  amount: number;
  remaining: number;
  kind: StepKind;
  note?: string;
}

export interface Waterfall {
  currency: string;
  invoiceGross: number;
  invoiceCurrency: string;
  expectedSettlement: number | null;
  fxLoss: number;
  /** Settlement starting point for the trail (actual received, or quoted). */
  gross: number;
  gatewayFees: number;
  afterFees: number;
  afterFx: number;
  expenses: number;
  afterExpenses: number;
  gstHstReserve: number;
  gstExclusiveSidecar: boolean;
  afterGst: number;
  salesCredit: number;
  salesRecipient: FounderId | null;
  afterSales: number;
  incomeTaxReserve: number;
  afterIncomeTax: number;
  studioReserve: number;
  projectPool: number;
  splitA: number;
  splitB: number;
  splitLabel: string;
  poolA: number;
  poolB: number;
  founderA: number;
  founderB: number;
  hoursA: number;
  hoursB: number;
  steps: WaterfallStep[];
}

export function hoursFor(project: Project, founder: FounderId): number {
  return round2(
    project.timeEntries
      .filter((t) => t.founder === founder)
      .reduce((s, t) => s + t.hours, 0),
  );
}

export function shareFromHours(
  hoursA: number,
  hoursB: number,
): { a: number; b: number; label: string } {
  const t = hoursA + hoursB;
  if (t <= 0) {
    return { a: 0.5, b: 0.5, label: "No hours yet — 50/50 fallback" };
  }
  return {
    a: hoursA / t,
    b: hoursB / t,
    label: "Hour-based",
  };
}

export function shareFromWeighted(
  weighted: Record<WeightCategoryId, WeightedScore>,
): { a: number; b: number; label: string } {
  let sa = 0;
  let sb = 0;
  for (const row of Object.values(weighted)) {
    sa += row.weight * row.a;
    sb += row.weight * row.b;
  }
  const t = sa + sb;
  if (t <= 0) {
    return { a: 0.5, b: 0.5, label: "No scores yet — 50/50 fallback" };
  }
  return { a: sa / t, b: sb / t, label: "Weighted contribution" };
}

export function shareFromFixed(
  fixedAPct: number,
): { a: number; b: number; label: string } {
  const a = Math.min(100, Math.max(0, fixedAPct)) / 100;
  return { a, b: 1 - a, label: `Fixed ${Math.round(a * 100)}/${Math.round((1 - a) * 100)}` };
}

export function contributionShare(project: Project): {
  a: number;
  b: number;
  label: string;
} {
  const method: SplitMethod =
    project.splitMethod === "hybrid" ? project.hybridBase : project.splitMethod;
  if (method === "hours") {
    return shareFromHours(hoursFor(project, "a"), hoursFor(project, "b"));
  }
  if (method === "fixed") return shareFromFixed(project.fixedSplitA);
  return shareFromWeighted(project.weighted);
}

function gatewayFeesOf(project: Project, gross: number): number {
  const recorded = project.expenses
    .filter((e) => e.category === "payment_processing")
    .reduce(
      (s, e) =>
        s +
        toSettlement(
          e.amount,
          e.currency,
          project.settlementCurrency,
          project.expectedFxRate,
        ),
      0,
    );
  if (recorded > 0) return round2(recorded);
  return round2(pct(gross, project.gatewayFeePct) + project.gatewayFeeFixed);
}

function projectExpensesOf(project: Project): number {
  return round2(
    project.expenses
      .filter((e) => e.category !== "payment_processing")
      .reduce(
        (s, e) =>
          s +
          toSettlement(
            e.amount,
            e.currency,
            project.settlementCurrency,
            project.expectedFxRate,
          ),
        0,
      ),
  );
}

function salesRecipient(acq: Acquisition): FounderId | null {
  if (acq === "a" || acq === "b") return acq;
  return null;
}

/**
 * Money trail, settlement currency.
 *
 * Order is locked and shown in the UI:
 * Gross → gateway fees → FX → expenses → GST/HST → sales credit
 * → income-tax reserve → studio reserve → project pool → founders.
 *
 * GST exclusive is a sidecar: it never enters the pool.
 * Sales credit is founder compensation (not a sink), then the rest of the
 * pool is split by the chosen contribution method.
 */
export function computeWaterfall(project: Project): Waterfall {
  const invoiceGross = round2(project.quotedPrice);
  const sameFx = project.invoiceCurrency === project.settlementCurrency;
  const expectedSettlement =
    !sameFx && project.expectedFxRate && project.expectedFxRate > 0
      ? round2(invoiceGross * project.expectedFxRate)
      : sameFx
        ? invoiceGross
        : null;

  const gross =
    project.actualReceived != null
      ? round2(project.actualReceived)
      : (expectedSettlement ?? invoiceGross);

  const fxLoss =
    !sameFx &&
    expectedSettlement != null &&
    project.actualReceived != null
      ? round2(Math.max(0, expectedSettlement - project.actualReceived))
      : 0;

  const steps: WaterfallStep[] = [];
  const push = (
    id: string,
    label: string,
    amount: number,
    remaining: number,
    kind: StepKind,
    note?: string,
  ) => {
    steps.push({
      id,
      label,
      amount: round2(amount),
      remaining: round2(remaining),
      kind,
      note,
    });
  };

  let remaining = gross;
  push("gross", "Client payment (gross)", gross, remaining, "inflow");

  const gatewayFees = gatewayFeesOf(project, gross);
  remaining = round2(remaining - gatewayFees);
  const afterFees = remaining;
  push(
    "fees",
    "Payment processing fees",
    gatewayFees,
    remaining,
    "deduction",
    "Deducted before shares and studio reserves.",
  );

  remaining = round2(remaining - fxLoss);
  const afterFx = remaining;
  push(
    "fx",
    "FX / conversion loss",
    fxLoss,
    remaining,
    "deduction",
    expectedSettlement != null && project.invoiceCurrency !== project.settlementCurrency
      ? `Expected ${expectedSettlement} ${project.settlementCurrency} from ${invoiceGross} ${project.invoiceCurrency}.`
      : undefined,
  );

  const expenses = projectExpensesOf(project);
  remaining = round2(remaining - expenses);
  const afterExpenses = remaining;
  push("expenses", "Business expenses", expenses, remaining, "deduction");

  const exclusive = project.taxMode === "exclusive";
  const gstHstReserve = pct(gross, project.gstHstPct);
  let afterGst = remaining;
  if (exclusive) {
    push(
      "gst",
      "GST/HST reserve (exclusive)",
      gstHstReserve,
      remaining,
      "sidecar",
      "Collected on top of the quoted price. Transit only — not in the project pool.",
    );
  } else {
    remaining = round2(remaining - gstHstReserve);
    afterGst = remaining;
    push(
      "gst",
      "GST/HST reserve (inclusive)",
      gstHstReserve,
      remaining,
      "reserve",
    );
  }

  const recipient = salesRecipient(project.acquisition);
  const salesApplies = recipient != null && project.salesCommissionPct > 0;
  const salesCredit = salesApplies
    ? pct(afterFees, project.salesCommissionPct)
    : 0;
  remaining = round2(remaining - salesCredit);
  const afterSales = remaining;
  push(
    "sales",
    "Sales / acquisition credit",
    salesCredit,
    remaining,
    "credit",
    salesApplies
      ? `${project.salesCommissionPct}% of amount after gateway fees.`
      : "No sales credit (organic, referral, or 0%).",
  );

  const incomeTaxReserve = pct(remaining, project.incomeTaxReservePct);
  remaining = round2(remaining - incomeTaxReserve);
  const afterIncomeTax = remaining;
  push(
    "income-tax",
    "Estimated income-tax reserve",
    incomeTaxReserve,
    remaining,
    "reserve",
  );

  const studioReserve = pct(remaining, project.studioReservePct);
  remaining = round2(remaining - studioReserve);
  const projectPool = remaining;
  push("studio", "Studio reserve", studioReserve, remaining, "reserve");
  push("pool", "Project compensation pool", projectPool, remaining, "pool");

  const share = contributionShare(project);
  const poolA = round2(projectPool * share.a);
  const poolB = round2(projectPool * share.b);
  const founderA = round2(poolA + (recipient === "a" ? salesCredit : 0));
  const founderB = round2(poolB + (recipient === "b" ? salesCredit : 0));

  push("founder-a", "Founder A compensation", founderA, 0, "payout");
  push("founder-b", "Founder B compensation", founderB, 0, "payout");

  return {
    currency: project.settlementCurrency,
    invoiceGross,
    invoiceCurrency: project.invoiceCurrency,
    expectedSettlement,
    fxLoss,
    gross,
    gatewayFees,
    afterFees,
    afterFx,
    expenses,
    afterExpenses,
    gstHstReserve,
    gstExclusiveSidecar: exclusive,
    afterGst,
    salesCredit,
    salesRecipient: salesApplies ? recipient : null,
    afterSales,
    incomeTaxReserve,
    afterIncomeTax,
    studioReserve,
    projectPool,
    splitA: share.a,
    splitB: share.b,
    splitLabel: share.label,
    poolA,
    poolB,
    founderA,
    founderB,
    hoursA: hoursFor(project, "a"),
    hoursB: hoursFor(project, "b"),
    steps,
  };
}

export function payoutStatus(
  accrued: number,
  paid: number,
): "unpaid" | "partial" | "paid" {
  if (paid <= 0.005) return "unpaid";
  if (paid + 0.005 < accrued) return "partial";
  return "paid";
}

export function paidTo(project: Project, founder: FounderId): number {
  return round2(
    project.payouts
      .filter((p) => p.founder === founder)
      .reduce(
        (s, p) =>
          s +
          toSettlement(
            p.amount,
            p.currency,
            project.settlementCurrency,
            project.expectedFxRate,
          ),
        0,
      ),
  );
}
