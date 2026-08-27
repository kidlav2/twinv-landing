/** Twin V Studio — internal ledger types. Not a tax engine. */

export type FounderId = "a" | "b";
export type AccountOwner = FounderId | "studio";
export type ActorId = FounderId | "system";

export type AccountKind =
  | "personal_bank"
  | "business_bank"
  | "stripe"
  | "paypal"
  | "wise"
  | "other";

export type CurrencyCode = "CAD" | "USD" | "EUR" | "GBP";

export type ProjectStatus =
  | "draft"
  | "active"
  | "delivered"
  | "maintenance"
  | "closed";

export type PaymentStatus = "unpaid" | "partial" | "paid";

export type PayoutStatus = "unpaid" | "partial" | "paid";

export type Acquisition = "a" | "b" | "organic" | "referral";

export type SplitMethod = "hours" | "weighted" | "fixed" | "hybrid";

export type HybridBase = "hours" | "weighted" | "fixed";

export type TaxMode = "inclusive" | "exclusive";

export type ClientType = "founding" | "standard";

export type PricingPreset = "starter" | "business" | "premium" | "custom";

export type PaymentSchedule = "upfront" | "fifty_fifty" | "thirty_seventy" | "custom";

export type ExpenseCategory =
  | "payment_processing"
  | "software"
  | "hosting"
  | "ads"
  | "contractor"
  | "travel"
  | "other";

export type WeightCategoryId =
  | "ux"
  | "ui"
  | "frontend"
  | "animations"
  | "backend"
  | "api"
  | "auth"
  | "integrations"
  | "seo"
  | "deployment"
  | "sales"
  | "pm"
  | "maintenance";

export interface StudioSettings {
  founderAName: string;
  founderBName: string;
  ownershipA: number;
  ownershipB: number;
  defaultSalesCommissionPct: number;
  defaultStudioReservePct: number;
  defaultIncomeTaxReservePct: number;
  defaultGstHstPct: number;
  defaultTaxMode: TaxMode;
  defaultGatewayFeePct: number;
  defaultGatewayFeeFixed: number;
  defaultSplitMethod: SplitMethod;
  defaultHybridBase: HybridBase;
  theme: "light" | "dark";
  actingAs: FounderId;
  starterPrice: number;
  businessPrice: number;
  premiumPrice: number;
  presetCurrency: CurrencyCode;
}

export interface PaymentAccount {
  id: string;
  name: string;
  kind: AccountKind;
  owner: AccountOwner;
  currency: CurrencyCode;
  notes: string;
}

export interface TimeEntry {
  id: string;
  founder: FounderId;
  date: string;
  durationRaw: string;
  hours: number;
  role: WeightCategoryId | "other";
  note: string;
}

export interface Expense {
  id: string;
  name: string;
  category: ExpenseCategory;
  amount: number;
  currency: CurrencyCode;
  paidBy: AccountOwner;
  date: string;
  note: string;
}

export interface Payout {
  id: string;
  founder: FounderId;
  amount: number;
  currency: CurrencyCode;
  date: string;
  accountId: string | null;
  note: string;
}

export interface ProjectPayment {
  id: string;
  label: string;
  sharePct: number;
  amount: number;
  status: "pending" | "received";
  receivedAt: string | null;
  actualReceived: number | null;
}

export interface WeightedScore {
  weight: number;
  a: number;
  b: number;
}

export interface AuditEntry {
  id: string;
  at: string;
  actor: ActorId;
  action: string;
  detail: string;
}

export interface Maintenance {
  includedMonths: number;
  startDate: string;
  monthlyAmount: number;
  currency: CurrencyCode;
  active: boolean;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  startDate: string;
  status: ProjectStatus;
  quotedPrice: number;
  invoiceCurrency: CurrencyCode;
  settlementCurrency: CurrencyCode;
  actualReceived: number | null;
  expectedFxRate: number | null;
  paymentStatus: PaymentStatus;
  paymentSchedule: PaymentSchedule;
  payments: ProjectPayment[];
  accountId: string | null;
  acquisition: Acquisition;
  salesCommissionPct: number;
  splitMethod: SplitMethod;
  hybridBase: HybridBase;
  fixedSplitA: number;
  weighted: Record<WeightCategoryId, WeightedScore>;
  studioReservePct: number;
  incomeTaxReservePct: number;
  gstHstPct: number;
  taxMode: TaxMode;
  gatewayFeePct: number;
  gatewayFeeFixed: number;
  clientType: ClientType;
  originalPrice: number | null;
  discountPct: number | null;
  pricingPreset: PricingPreset;
  maintenance: Maintenance;
  timeEntries: TimeEntry[];
  expenses: Expense[];
  payouts: Payout[];
  audit: AuditEntry[];
}

export interface LedgerState {
  version: number;
  settings: StudioSettings;
  accounts: PaymentAccount[];
  projects: Project[];
}
