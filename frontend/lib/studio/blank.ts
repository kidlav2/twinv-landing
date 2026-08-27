import type { Project, StudioSettings } from "./types";
import { emptyWeighted } from "./constants";
import { nid } from "./id";

export function blankProject(settings: StudioSettings): Project {
  const today = new Date().toISOString().slice(0, 10);
  return {
    id: nid("prj"),
    name: "New project",
    client: "",
    startDate: today,
    status: "draft",
    quotedPrice: settings.businessPrice,
    invoiceCurrency: settings.presetCurrency,
    settlementCurrency: settings.presetCurrency,
    actualReceived: null,
    expectedFxRate: null,
    paymentStatus: "unpaid",
    paymentSchedule: "upfront",
    payments: [],
    accountId: null,
    acquisition: "a",
    salesCommissionPct: settings.defaultSalesCommissionPct,
    splitMethod: settings.defaultSplitMethod,
    hybridBase: settings.defaultHybridBase,
    fixedSplitA: 50,
    weighted: emptyWeighted(),
    studioReservePct: settings.defaultStudioReservePct,
    incomeTaxReservePct: settings.defaultIncomeTaxReservePct,
    gstHstPct: settings.defaultGstHstPct,
    taxMode: settings.defaultTaxMode,
    gatewayFeePct: settings.defaultGatewayFeePct,
    gatewayFeeFixed: settings.defaultGatewayFeeFixed,
    clientType: "standard",
    originalPrice: null,
    discountPct: null,
    pricingPreset: "custom",
    maintenance: {
      includedMonths: 3,
      startDate: today,
      monthlyAmount: 0,
      currency: settings.presetCurrency,
      active: false,
    },
    timeEntries: [],
    expenses: [],
    payouts: [],
    audit: [],
  };
}
