import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeWaterfall } from "./calc.ts";
import { parseDuration, formatHours } from "./hours.ts";
import { requiredClientPrice } from "./reverse.ts";
import { sampleState } from "./sample.ts";
import { emptyWeighted } from "./constants.ts";
import type { Project } from "./types.ts";

function base(over: Partial<Project> = {}): Project {
  return {
    id: "t",
    name: "T",
    client: "C",
    startDate: "2026-01-01",
    status: "active",
    quotedPrice: 2000,
    invoiceCurrency: "CAD",
    settlementCurrency: "CAD",
    actualReceived: 2000,
    expectedFxRate: null,
    paymentStatus: "paid",
    paymentSchedule: "upfront",
    payments: [],
    accountId: null,
    acquisition: "organic",
    salesCommissionPct: 0,
    splitMethod: "fixed",
    hybridBase: "fixed",
    fixedSplitA: 50,
    weighted: emptyWeighted(),
    studioReservePct: 10,
    incomeTaxReservePct: 0,
    gstHstPct: 0,
    taxMode: "inclusive",
    gatewayFeePct: 2.9,
    gatewayFeeFixed: 0.3,
    clientType: "standard",
    originalPrice: null,
    discountPct: null,
    pricingPreset: "custom",
    maintenance: {
      includedMonths: 3,
      startDate: "2026-01-01",
      monthlyAmount: 0,
      currency: "CAD",
      active: false,
    },
    timeEntries: [],
    expenses: [],
    payouts: [],
    audit: [],
    ...over,
  };
}

describe("hours", () => {
  it("parses 35m as 0.583h", () => {
    const h = parseDuration("35m");
    assert.ok(h);
    assert.equal(Number(h.toFixed(3)), 0.583);
    assert.equal(formatHours(h), "0.583h");
  });
  it("parses 1h 20m", () => {
    assert.equal(parseDuration("1h 20m"), 1 + 20 / 60);
  });
});

describe("waterfall", () => {
  it("takes Stripe fees before any split — ~$1,940 not $2,000", () => {
    const w = computeWaterfall(base({ gstHstPct: 0, studioReservePct: 0 }));
    assert.equal(w.gatewayFees, 58.3);
    assert.equal(w.afterFees, 1941.7);
    assert.equal(w.projectPool, 1941.7);
    assert.equal(w.founderA, 970.85);
    assert.equal(w.founderB, 970.85);
  });

  it("inclusive GST comes out of gross; exclusive does not", () => {
    const incl = computeWaterfall(
      base({
        gstHstPct: 5,
        taxMode: "inclusive",
        gatewayFeePct: 0,
        gatewayFeeFixed: 0,
        studioReservePct: 0,
      }),
    );
    const excl = computeWaterfall(
      base({
        gstHstPct: 5,
        taxMode: "exclusive",
        gatewayFeePct: 0,
        gatewayFeeFixed: 0,
        studioReservePct: 0,
      }),
    );
    assert.equal(incl.gstHstReserve, 100);
    assert.equal(incl.projectPool, 1900);
    assert.equal(incl.gstExclusiveSidecar, false);
    assert.equal(excl.gstHstReserve, 100);
    assert.equal(excl.projectPool, 2000);
    assert.equal(excl.gstExclusiveSidecar, true);
  });

  it("sales credit is 10% of amount after fees, paid to the closer", () => {
    const w = computeWaterfall(
      base({
        acquisition: "a",
        salesCommissionPct: 10,
        gatewayFeePct: 2.9,
        gatewayFeeFixed: 0.3,
        studioReservePct: 0,
        gstHstPct: 0,
        splitMethod: "fixed",
        fixedSplitA: 50,
      }),
    );
    assert.equal(w.salesCredit, 194.17);
    assert.equal(w.salesRecipient, "a");
    assert.ok(w.founderA > w.founderB);
    assert.equal(w.founderA, w.poolA + w.salesCredit);
  });

  it("studio reserve is taken before the founder split", () => {
    const w = computeWaterfall(
      base({
        gatewayFeePct: 0,
        gatewayFeeFixed: 0,
        studioReservePct: 10,
        gstHstPct: 0,
      }),
    );
    assert.equal(w.studioReserve, 200);
    assert.equal(w.projectPool, 1800);
    assert.equal(w.founderA + w.founderB, 1800);
  });

  it("does not treat a same-currency partial payment as FX loss", () => {
    const w = computeWaterfall(
      base({
        quotedPrice: 2000,
        actualReceived: 1000,
        invoiceCurrency: "CAD",
        settlementCurrency: "CAD",
        gatewayFeePct: 0,
        gatewayFeeFixed: 0,
        studioReservePct: 0,
      }),
    );
    assert.equal(w.fxLoss, 0);
    assert.equal(w.gross, 1000);
    assert.equal(w.projectPool, 1000);
  });

  it("records FX loss only when invoice and settlement currencies differ", () => {
    const w = computeWaterfall(
      base({
        quotedPrice: 4000,
        invoiceCurrency: "USD",
        settlementCurrency: "CAD",
        expectedFxRate: 1.36,
        actualReceived: 5320,
        gatewayFeePct: 0,
        gatewayFeeFixed: 0,
        studioReservePct: 0,
      }),
    );
    assert.equal(w.expectedSettlement, 5440);
    assert.equal(w.fxLoss, 120);
    assert.equal(w.gross, 5320);
    assert.equal(w.projectPool, 5200);
  });

  it("does not invent a tax rate when the user left reserves at 0", () => {
    const w = computeWaterfall(
      base({ gstHstPct: 0, incomeTaxReservePct: 0, gatewayFeePct: 0, gatewayFeeFixed: 0, studioReservePct: 0 }),
    );
    assert.equal(w.gstHstReserve, 0);
    assert.equal(w.incomeTaxReserve, 0);
  });
});

describe("sample scenarios", () => {
  it("seeds $1,500 / $2,500 / $4,000 projects", () => {
    const prices = sampleState()
      .projects.map((p) => p.quotedPrice)
      .sort((a, b) => a - b);
    assert.deepEqual(prices, [1500, 2500, 4000]);
  });

  it("Harbor founding client is not a 50/50 of $1,500", () => {
    const harbor = sampleState().projects.find((p) => p.id === "harbor")!;
    const w = computeWaterfall(harbor);
    assert.ok(Math.abs(w.founderA - w.founderB) > 50);
    assert.ok(w.founderA + w.founderB < 1500);
    assert.ok(w.gatewayFees > 0);
    assert.ok(w.studioReserve > 0);
  });
});

describe("reverse price", () => {
  it("round-trips a simple no-fee case", () => {
    const rev = requiredClientPrice(
      {
        desiredA: 900,
        desiredB: 900,
        feePct: 0,
        feeFixed: 0,
        expenses: 0,
        fxLoss: 0,
        gstPct: 0,
        taxMode: "inclusive",
        salesPct: 0,
        salesApplies: false,
        incomeTaxPct: 0,
        studioReservePct: 10,
      },
      0.5,
    );
    assert.equal(rev.requiredGross, 2000);
    assert.equal(rev.pool, 1800);
  });
});
