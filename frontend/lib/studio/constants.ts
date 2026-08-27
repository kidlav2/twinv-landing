import type {
  ExpenseCategory,
  SplitMethod,
  WeightCategoryId,
  WeightedScore,
} from "./types";

export const LEDGER_VERSION = 2;
export const STORAGE_KEY = "twinv.studio-ledger.v1";

export const WEIGHT_CATEGORIES: {
  id: WeightCategoryId;
  label: string;
  defaultWeight: number;
}[] = [
  { id: "ux", label: "UX", defaultWeight: 1 },
  { id: "ui", label: "UI", defaultWeight: 1 },
  { id: "frontend", label: "Frontend", defaultWeight: 1 },
  { id: "animations", label: "Animations", defaultWeight: 1 },
  { id: "backend", label: "Backend", defaultWeight: 1 },
  { id: "api", label: "API", defaultWeight: 1 },
  { id: "auth", label: "Auth", defaultWeight: 1 },
  { id: "integrations", label: "Integrations", defaultWeight: 1 },
  { id: "seo", label: "SEO", defaultWeight: 1 },
  { id: "deployment", label: "Deploy / hosting", defaultWeight: 1 },
  { id: "sales", label: "Sales", defaultWeight: 1 },
  { id: "pm", label: "Project management", defaultWeight: 1 },
  { id: "maintenance", label: "Maintenance", defaultWeight: 0.5 },
];

export function emptyWeighted(): Record<WeightCategoryId, WeightedScore> {
  return Object.fromEntries(
    WEIGHT_CATEGORIES.map((c) => [
      c.id,
      { weight: c.defaultWeight, a: 0, b: 0 },
    ]),
  ) as Record<WeightCategoryId, WeightedScore>;
}

export const EXPENSE_CATEGORIES: { id: ExpenseCategory; label: string }[] = [
  { id: "payment_processing", label: "Payment processing (system)" },
  { id: "software", label: "Software" },
  { id: "hosting", label: "Hosting" },
  { id: "ads", label: "Ads / outreach" },
  { id: "contractor", label: "Contractor" },
  { id: "travel", label: "Travel" },
  { id: "other", label: "Other" },
];

export const SPLIT_METHODS: { id: SplitMethod; label: string; hint: string }[] =
  [
    {
      id: "hours",
      label: "Method A — Hours",
      hint: "Share follows decimal hours. Time is not always equal to value.",
    },
    {
      id: "weighted",
      label: "Method B — Weighted",
      hint: "Recommended. Score 0–100 per category; AI speed lives here, not in hours.",
    },
    {
      id: "fixed",
      label: "Method C — Fixed split",
      hint: "Manual 70/30, 60/40, 50/50.",
    },
    {
      id: "hybrid",
      label: "Method D — Hybrid",
      hint: "Sales credit first, remainder by hours, weighted, or fixed.",
    },
  ];

export const DISCLAIMER =
  "INTERNAL ESTIMATE ONLY. These figures are a studio planning model, not tax, payroll, or legal advice.";

export const TAX_DISCLAIMER =
  "These are internal planning reserves, not tax calculations.";

export const ACCOUNT_WARNING =
  "Receiving client payments into a personal account does not automatically make the payment personal income. Confirm with a Canadian accountant.";

export const CROSS_BORDER_WARNING =
  "Cross-border payments between co-founders may have tax, reporting, withholding, or corporate implications. Consult a CPA.";

export const TIME_NOTE =
  "Time spent is not always equal to value delivered. Account for AI acceleration in Weighted contribution, not by inflating hours.";

export const DEFAULT_SETTINGS = {
  founderAName: "Founder A",
  founderBName: "Founder B",
  ownershipA: 50,
  ownershipB: 50,
  defaultSalesCommissionPct: 10,
  defaultStudioReservePct: 10,
  defaultIncomeTaxReservePct: 0,
  defaultGstHstPct: 0,
  defaultTaxMode: "inclusive" as const,
  defaultGatewayFeePct: 2.9,
  defaultGatewayFeeFixed: 0.3,
  defaultSplitMethod: "weighted" as const,
  defaultHybridBase: "weighted" as const,
  theme: "light" as const,
  actingAs: "a" as const,
  starterPrice: 1500,
  businessPrice: 2500,
  premiumPrice: 4000,
  presetCurrency: "CAD" as const,
};
