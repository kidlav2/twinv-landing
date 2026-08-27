import type { FounderId, LedgerState } from "./types";
import { computeWaterfall, paidTo } from "./calc";
import { round2, toSettlement } from "./money";
import { maintenanceAlert } from "./maintenance";

export function rollup(state: LedgerState) {
  const rows = state.projects.map((p) => ({
    project: p,
    w: computeWaterfall(p),
  }));

  const sum = (fn: (r: (typeof rows)[number]) => number) =>
    round2(rows.reduce((s, r) => s + fn(r), 0));

  const revenue = sum((r) => r.w.gross);
  const quoted = sum((r) =>
    toSettlement(
      r.project.quotedPrice,
      r.project.invoiceCurrency,
      r.project.settlementCurrency,
      r.project.expectedFxRate,
    ),
  );
  const fees = sum((r) => r.w.gatewayFees);
  const expenses = sum((r) => r.w.expenses);
  const tax = sum(
    (r) =>
      r.w.incomeTaxReserve +
      (r.w.gstExclusiveSidecar ? 0 : r.w.gstHstReserve),
  );
  const gstSidecar = sum((r) =>
    r.w.gstExclusiveSidecar ? r.w.gstHstReserve : 0,
  );
  const studio = sum((r) => r.w.studioReserve);
  const accruedA = sum((r) => r.w.founderA);
  const accruedB = sum((r) => r.w.founderB);
  const paidA = sum((r) => paidTo(r.project, "a"));
  const paidB = sum((r) => paidTo(r.project, "b"));
  const unpaidProjects = state.projects.filter(
    (p) => p.paymentStatus !== "paid",
  ).length;

  const mrr = round2(
    state.projects
      .filter((p) => {
        if (!p.maintenance.active || p.maintenance.monthlyAmount <= 0)
          return false;
        const alert = maintenanceAlert(p.maintenance);
        return alert?.level === "overdue";
      })
      .reduce(
        (s, p) =>
          s +
          toSettlement(
            p.maintenance.monthlyAmount,
            p.maintenance.currency,
            "CAD",
            p.expectedFxRate,
          ),
        0,
      ),
  );

  const alerts = state.projects
    .map((p) => {
      const alert = maintenanceAlert(p.maintenance);
      return alert ? { project: p, alert } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x != null);

  return {
    rows,
    revenue,
    quoted,
    fees,
    expenses,
    tax,
    gstSidecar,
    studio,
    accruedA,
    accruedB,
    paidA,
    paidB,
    unpaidA: round2(accruedA - paidA),
    unpaidB: round2(accruedB - paidB),
    unpaidProjects,
    mrr,
    arr: round2(mrr * 12),
    alerts,
  };
}

export function founderExpenses(state: LedgerState, founder: FounderId) {
  return round2(
    state.projects.reduce((s, p) => {
      const part = p.expenses
        .filter((e) => e.paidBy === founder)
        .reduce(
          (x, e) =>
            x +
            toSettlement(
              e.amount,
              e.currency,
              p.settlementCurrency,
              p.expectedFxRate,
            ),
          0,
        );
      return s + part;
    }, 0),
  );
}
