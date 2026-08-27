import type {
  Acquisition,
  CurrencyCode,
  Expense,
  ExpenseCategory,
  FounderId,
  LedgerState,
  PaymentStatus,
  Project,
  ProjectStatus,
  SplitMethod,
  StudioSettings,
  TaxMode,
  TimeEntry,
  Payout,
  AccountOwner,
} from "./types";
import { blankProject } from "./blank";
import { parseDuration } from "./hours";
import { audit, nid } from "./id";
import { LEDGER_VERSION } from "./constants";

export type ImportKind =
  | "ledger"
  | "projects"
  | "expenses"
  | "time"
  | "payouts"
  | "stripe"
  | "mixed";

export interface ImportPreview {
  kind: ImportKind;
  summary: string;
  warnings: string[];
  projects: number;
  expenses: number;
  time: number;
  payouts: number;
}

export interface ParsedImport {
  preview: ImportPreview;
  next: LedgerState;
}

const HEADER_MAP: Record<string, string> = {
  project: "project",
  "project name": "project",
  name: "project",
  title: "project",
  название: "project",
  проект: "project",
  client: "client",
  клиент: "client",
  company: "client",
  customer: "client",
  description: "description",
  описание: "description",
  date: "date",
  "start date": "date",
  created: "date",
  дата: "date",
  quoted: "quoted",
  "quoted price": "quoted",
  price: "quoted",
  "invoice amount": "quoted",
  invoice: "quoted",
  сумма: "quoted",
  amount: "amount",
  net: "net",
  received: "received",
  "actual received": "received",
  fee: "fee",
  fees: "fee",
  "gateway fee": "fee",
  currency: "currency",
  "invoice currency": "invoice_currency",
  "settlement currency": "settlement_currency",
  settlement: "settlement_currency",
  fx: "fx",
  "fx rate": "fx",
  rate: "fx",
  status: "status",
  "payment status": "payment_status",
  schedule: "schedule",
  acquisition: "acquisition",
  sales: "acquisition",
  commission: "commission",
  "studio reserve": "studio_reserve",
  gst: "gst",
  hst: "gst",
  "gst/hst": "gst",
  tax: "gst",
  "tax mode": "tax_mode",
  split: "split",
  method: "split",
  type: "type",
  "row type": "type",
  category: "category",
  expense: "expense",
  "expense name": "expense",
  "paid by": "paid_by",
  founder: "founder",
  who: "founder",
  duration: "duration",
  hours: "hours",
  time: "duration",
  role: "role",
  note: "note",
  notes: "note",
  payout: "payout",
  transfer: "payout",
  preset: "preset",
  "client type": "client_type",
};

function normHeader(h: string): string {
  const raw = h.replace(/^\ufeff/, "").toLowerCase().replace(/[^a-z0-9а-яё]+/gi, " ").trim();
  return HEADER_MAP[raw] ?? raw;
}

export function parseCsv(text: string): string[][] {
  const src = text.replace(/^\ufeff/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const first = src.split("\n").find((l) => l.trim()) ?? "";
  const comma = (first.match(/,/g) ?? []).length;
  const semi = (first.match(/;/g) ?? []).length;
  const tab = (first.match(/\t/g) ?? []).length;
  const delim =
    tab >= comma && tab >= semi && tab > 0 ? "\t" : semi > comma ? ";" : ",";

  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let q = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (q) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          cell += '"';
          i++;
        } else q = false;
      } else cell += c;
    } else if (c === '"') q = true;
    else if (c === delim) {
      row.push(cell.trim());
      cell = "";
    } else if (c === "\n") {
      row.push(cell.trim());
      if (row.some((x) => x !== "")) rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  row.push(cell.trim());
  if (row.some((x) => x !== "")) rows.push(row);
  return rows;
}

export function parseMoney(raw: string | undefined | null): number | null {
  const s = (raw ?? "").trim();
  if (!s) return null;
  const neg = /^\(.*\)$/.test(s) || s.startsWith("-");
  let t = s.replace(/[()\s]/g, "").replace(/^[+\-]/, "");
  t = t.replace(/[^\d,.\-]/g, "");
  if (!t) return null;
  if (t.includes(",") && t.includes(".")) {
    t = t.lastIndexOf(",") > t.lastIndexOf(".") ? t.replace(/\./g, "").replace(",", ".") : t.replace(/,/g, "");
  } else if ((t.match(/,/g) ?? []).length === 1 && /^\d+,\d{1,2}$/.test(t)) {
    t = t.replace(",", ".");
  } else {
    t = t.replace(/,/g, "");
  }
  const n = Number(t);
  if (!Number.isFinite(n)) return null;
  return neg ? -Math.abs(n) : n;
}

export function parseDate(raw: string | undefined | null): string | null {
  const s = (raw ?? "").trim();
  if (!s) return null;
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const dmy = s.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/);
  if (dmy) {
    const a = Number(dmy[1]);
    const b = Number(dmy[2]);
    const y = dmy[3];
    if (a > 12) return `${y}-${pad(b)}-${pad(a)}`;
    if (b > 12) return `${y}-${pad(a)}-${pad(b)}`;
    return `${y}-${pad(b)}-${pad(a)}`;
  }
  const ts = Date.parse(s);
  if (!Number.isNaN(ts)) return new Date(ts).toISOString().slice(0, 10);
  return null;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function currencyOf(raw: string | undefined, fallback: CurrencyCode): CurrencyCode {
  const s = (raw ?? "").trim().toUpperCase();
  if (s.includes("USD") || s.includes("US$")) return "USD";
  if (s.includes("EUR") || s.includes("€")) return "EUR";
  if (s.includes("GBP") || s.includes("£")) return "GBP";
  if (s.includes("CAD") || s.includes("C$") || s.includes("CA$")) return "CAD";
  if (s === "USD" || s === "CAD" || s === "EUR" || s === "GBP") return s;
  return fallback;
}

function founderOf(raw: string | undefined, settings: StudioSettings): FounderId | null {
  const s = (raw ?? "").trim().toLowerCase();
  if (!s) return null;
  const a = settings.founderAName.toLowerCase();
  const b = settings.founderBName.toLowerCase();
  if (
    s === "a" ||
    s === "founder a" ||
    s === a ||
    /\b(vlad|vladislav|влад|владислав)\b/.test(s)
  )
    return "a";
  if (
    s === "b" ||
    s === "founder b" ||
    s === b ||
    /\b(vanya|vanja|ivan|ваня)\b/.test(s)
  )
    return "b";
  if (a && s.includes(a)) return "a";
  if (b && s.includes(b)) return "b";
  return null;
}

function ownerOf(raw: string | undefined, settings: StudioSettings): AccountOwner {
  const s = (raw ?? "").trim().toLowerCase();
  if (s.includes("studio") || s.includes("twin")) return "studio";
  return founderOf(raw, settings) ?? "studio";
}

function statusOf(raw: string | undefined): ProjectStatus | null {
  const s = (raw ?? "").toLowerCase();
  if (["draft", "active", "delivered", "maintenance", "closed"].includes(s)) {
    return s as ProjectStatus;
  }
  return null;
}

function payStatusOf(raw: string | undefined): PaymentStatus | null {
  const s = (raw ?? "").toLowerCase();
  if (s.includes("partial")) return "partial";
  if (s.includes("paid") || s.includes("received") || s.includes("succeeded")) return "paid";
  if (s.includes("unpaid") || s.includes("pending")) return "unpaid";
  return null;
}

function splitOf(raw: string | undefined): SplitMethod | null {
  const s = (raw ?? "").toLowerCase();
  if (s.includes("hour")) return "hours";
  if (s.includes("weight")) return "weighted";
  if (s.includes("hybrid")) return "hybrid";
  if (s.includes("fixed") || /^\d+\s*\/\s*\d+$/.test(s)) return "fixed";
  return null;
}

function taxModeOf(raw: string | undefined): TaxMode | null {
  const s = (raw ?? "").toLowerCase();
  if (s.includes("excl")) return "exclusive";
  if (s.includes("incl")) return "inclusive";
  return null;
}

function acqOf(raw: string | undefined, settings: StudioSettings): Acquisition | null {
  const s = (raw ?? "").toLowerCase();
  if (s.includes("organic")) return "organic";
  if (s.includes("refer")) return "referral";
  return founderOf(raw, settings);
}

function expenseCat(raw: string | undefined): ExpenseCategory {
  const s = (raw ?? "").toLowerCase();
  if (s.includes("stripe") || s.includes("paypal") || s.includes("process") || s.includes("fee"))
    return "payment_processing";
  if (s.includes("host")) return "hosting";
  if (s.includes("soft") || s.includes("figma") || s.includes("adobe")) return "software";
  if (s.includes("ad") || s.includes("outreach")) return "ads";
  if (s.includes("contract")) return "contractor";
  if (s.includes("travel")) return "travel";
  return "other";
}

function pct(raw: string | undefined): number | null {
  const n = parseMoney((raw ?? "").replace("%", ""));
  return n;
}

type Row = Record<string, string>;

function asRows(table: string[][]): { headers: string[]; rows: Row[] } {
  const headers = (table[0] ?? []).map(normHeader);
  const rows = table.slice(1).map((cells) => {
    const o: Row = {};
    headers.forEach((h, i) => {
      if (h) o[h] = cells[i] ?? "";
    });
    return o;
  });
  return { headers, rows };
}

function detectKind(headers: string[]): ImportKind {
  const h = new Set(headers);
  if (h.has("type")) return "mixed";
  if (h.has("duration") || h.has("hours")) return "time";
  if (h.has("fee") && (h.has("net") || h.has("amount"))) return "stripe";
  if (h.has("payout")) return "payouts";
  if (h.has("category") || h.has("expense")) return "expenses";
  return "projects";
}

function projectKey(name: string, client: string): string {
  return `${name.trim().toLowerCase()}|${client.trim().toLowerCase()}`;
}

function findProject(projects: Project[], name: string, client: string): Project | undefined {
  const key = projectKey(name, client);
  return projects.find((p) => projectKey(p.name, p.client) === key) ??
    projects.find((p) => p.name.trim().toLowerCase() === name.trim().toLowerCase());
}

function fillProject(p: Project, row: Row, settings: StudioSettings): Project {
  const name = row.project || row.description || p.name;
  const client = row.client || p.client;
  const quoted = parseMoney(row.quoted || (row.amount && !row.net ? row.amount : "") || "");
  const received = parseMoney(row.received || row.net || "");
  const inv = row.invoice_currency ? currencyOf(row.invoice_currency, p.invoiceCurrency) : p.invoiceCurrency;
  const setl = row.settlement_currency
    ? currencyOf(row.settlement_currency, p.settlementCurrency)
    : row.currency
      ? currencyOf(row.currency, p.settlementCurrency)
      : p.settlementCurrency;
  const next: Project = {
    ...p,
    name: name || p.name,
    client,
    startDate: parseDate(row.date) ?? p.startDate,
    quotedPrice: quoted ?? p.quotedPrice,
    invoiceCurrency: inv,
    settlementCurrency: setl,
    actualReceived: received ?? p.actualReceived,
    expectedFxRate: parseMoney(row.fx) ?? p.expectedFxRate,
    paymentStatus: payStatusOf(row.payment_status || row.status) ?? p.paymentStatus,
    status: statusOf(row.status) ?? p.status,
    acquisition: acqOf(row.acquisition, settings) ?? p.acquisition,
    salesCommissionPct: pct(row.commission) ?? p.salesCommissionPct,
    studioReservePct: pct(row.studio_reserve) ?? p.studioReservePct,
    gstHstPct: pct(row.gst) ?? p.gstHstPct,
    taxMode: taxModeOf(row.tax_mode) ?? p.taxMode,
    splitMethod: splitOf(row.split) ?? p.splitMethod,
  };
  if (row.preset === "starter" || row.preset === "business" || row.preset === "premium") {
    next.pricingPreset = row.preset;
  }
  if ((row.client_type || "").toLowerCase().includes("found")) next.clientType = "founding";
  return next;
}

function applyRow(
  state: LedgerState,
  row: Row,
  kind: ImportKind,
  actor: FounderId,
): { state: LedgerState; used: "project" | "expense" | "time" | "payout" | "skip" } {
  const rowKind = (row.type || kind).toLowerCase();
  const isTime = kind === "time" || rowKind === "time";
  const isExp = kind === "expenses" || rowKind === "expense" || rowKind === "expenses";
  const isPay = kind === "payouts" || rowKind === "payout" || rowKind === "transfer";
  const isStripe = kind === "stripe";

  const projectName = row.project || row.description || "Imported";
  const client = row.client || "";
  let projects = [...state.projects];
  let project = findProject(projects, projectName, client);
  const moneyRow = !isTime && !isExp && !isPay;

  if (!project) {
    const stub = blankProject(state.settings);
    stub.name = projectName;
    stub.client = client;
    stub.startDate = parseDate(row.date) ?? stub.startDate;
    project = moneyRow
      ? fillProject(stub, { ...row, project: projectName, client }, state.settings)
      : stub;
    project.audit = [audit(actor, "import", `Imported ${project.name}`)];
    projects = [project, ...projects];
  } else if (moneyRow) {
    const next = fillProject(project, row, state.settings);
    next.audit = [audit(actor, "import", `Updated ${next.name} from file`), ...next.audit];
    projects = projects.map((p) => (p.id === project!.id ? next : p));
    project = next;
  }

  if (isStripe) {
    const fee = parseMoney(row.fee);
    const net = parseMoney(row.net);
    const amount = parseMoney(row.amount);
    const cur = currencyOf(row.currency || "", project.settlementCurrency);
    project = {
      ...project,
      quotedPrice: amount ?? project.quotedPrice,
      actualReceived: net ?? project.actualReceived,
      invoiceCurrency: cur,
      settlementCurrency: cur,
      paymentStatus: payStatusOf(row.status) ?? "paid",
    };
    if (fee && fee > 0) {
      const exp: Expense = {
        id: nid("ex"),
        name: "Payment processing",
        category: "payment_processing",
        amount: fee,
        currency: cur,
        paidBy: "studio",
        date: parseDate(row.date) ?? project.startDate,
        note: "Imported fee",
      };
      project = { ...project, expenses: [...project.expenses, exp] };
    }
    project = {
      ...project,
      audit: [audit(actor, "import", "Stripe row"), ...project.audit],
    };
    projects = projects.map((p) => (p.id === project!.id ? project! : p));
    return { state: { ...state, projects }, used: "project" };
  }

  if (isExp) {
    const amount = parseMoney(row.amount || row.quoted);
    if (amount == null) return { state: { ...state, projects }, used: "skip" };
    const exp: Expense = {
      id: nid("ex"),
      name: row.expense || row.description || row.category || "Expense",
      category: expenseCat(row.category || row.expense || ""),
      amount,
      currency: currencyOf(row.currency || "", project.settlementCurrency),
      paidBy: ownerOf(row.paid_by || row.founder || "", state.settings),
      date: parseDate(row.date) ?? project.startDate,
      note: row.note || "",
    };
    project = {
      ...project,
      expenses: [...project.expenses, exp],
      audit: [audit(actor, "import", `Expense ${exp.name}`), ...project.audit],
    };
    projects = projects.map((p) => (p.id === project!.id ? project! : p));
    return { state: { ...state, projects }, used: "expense" };
  }

  if (isTime) {
    const hours = parseDuration(row.duration || row.hours || "");
    if (hours == null) return { state: { ...state, projects }, used: "skip" };
    const founder = founderOf(row.founder || "", state.settings) ?? "a";
    const entry: TimeEntry = {
      id: nid("t"),
      founder,
      date: parseDate(row.date) ?? project.startDate,
      durationRaw: row.duration || row.hours,
      hours,
      role: "other",
      note: row.note || row.role || "",
    };
    project = {
      ...project,
      timeEntries: [...project.timeEntries, entry],
      audit: [audit(actor, "import", `Time ${entry.durationRaw}`), ...project.audit],
    };
    projects = projects.map((p) => (p.id === project!.id ? project! : p));
    return { state: { ...state, projects }, used: "time" };
  }

  if (isPay) {
    const amount = parseMoney(row.amount || row.payout);
    if (amount == null) return { state: { ...state, projects }, used: "skip" };
    const founder = founderOf(row.founder || "", state.settings) ?? "a";
    const pay: Payout = {
      id: nid("po"),
      founder,
      amount,
      currency: currencyOf(row.currency || "", project.settlementCurrency),
      date: parseDate(row.date) ?? project.startDate,
      accountId: project.accountId,
      note: row.note || "Imported transfer",
    };
    project = {
      ...project,
      payouts: [...project.payouts, pay],
      audit: [audit(actor, "import", `Payout ${amount}`), ...project.audit],
    };
    projects = projects.map((p) => (p.id === project!.id ? project! : p));
    return { state: { ...state, projects }, used: "payout" };
  }

  return { state: { ...state, projects }, used: "project" };
}

function isLedger(json: unknown): json is LedgerState {
  if (!json || typeof json !== "object") return false;
  const o = json as LedgerState;
  return Array.isArray(o.projects) && o.settings != null && Array.isArray(o.accounts);
}

function hydrateLedger(raw: LedgerState, fallback: StudioSettings): LedgerState {
  return {
    version: LEDGER_VERSION,
    settings: { ...fallback, ...raw.settings },
    accounts: raw.accounts ?? [],
    projects: (raw.projects ?? []).map((p) => ({
      ...blankProject({ ...fallback, ...raw.settings }),
      ...p,
      weighted: p.weighted ?? blankProject(fallback).weighted,
      timeEntries: p.timeEntries ?? [],
      expenses: p.expenses ?? [],
      payouts: p.payouts ?? [],
      payments: p.payments ?? [],
      audit: p.audit ?? [],
    })),
  };
}

export function parseImportFile(
  filename: string,
  text: string,
  current: LedgerState,
  actor: FounderId,
): ParsedImport {
  const warnings: string[] = [];
  const lower = filename.toLowerCase();

  if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
    return {
      preview: {
        kind: "projects",
        summary: "Excel files need to be saved as CSV or JSON first.",
        warnings: ["Save the spreadsheet as CSV, then drop that file."],
        projects: 0,
        expenses: 0,
        time: 0,
        payouts: 0,
      },
      next: current,
    };
  }

  const trimmed = text.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const json = JSON.parse(trimmed) as unknown;
      if (isLedger(json)) {
        const next = hydrateLedger(json, current.settings);
        return {
          preview: {
            kind: "ledger",
            summary: `Full ledger: ${next.projects.length} project(s), ${next.accounts.length} account(s).`,
            warnings,
            projects: next.projects.length,
            expenses: next.projects.reduce((s, p) => s + p.expenses.length, 0),
            time: next.projects.reduce((s, p) => s + p.timeEntries.length, 0),
            payouts: next.projects.reduce((s, p) => s + p.payouts.length, 0),
          },
          next,
        };
      }
      if (Array.isArray(json)) {
        warnings.push("JSON array treated as project list.");
      }
    } catch {
      warnings.push("File looked like JSON but did not parse. Trying CSV.");
    }
  }

  const table = parseCsv(text);
  if (table.length < 2) {
    return {
      preview: {
        kind: "projects",
        summary: "No data rows found.",
        warnings: ["Need a header row and at least one data row."],
        projects: 0,
        expenses: 0,
        time: 0,
        payouts: 0,
      },
      next: current,
    };
  }

  const { headers, rows } = asRows(table);
  const kind = detectKind(headers);
  let state = current;
  let projects = 0;
  let expenses = 0;
  let time = 0;
  let payouts = 0;

  for (const row of rows) {
    const empty = Object.values(row).every((v) => !v);
    if (empty) continue;
    const applied = applyRow(state, row, kind, actor);
    state = applied.state;
    if (applied.used === "project") projects += 1;
    if (applied.used === "expense") expenses += 1;
    if (applied.used === "time") time += 1;
    if (applied.used === "payout") payouts += 1;
  }

  const labels: Record<ImportKind, string> = {
    ledger: "ledger",
    projects: "projects",
    expenses: "expenses",
    time: "time entries",
    payouts: "payouts",
    stripe: "Stripe payouts",
    mixed: "mixed rows",
  };

  return {
    preview: {
      kind,
      summary: `Detected ${labels[kind]} · ${projects} project row(s), ${expenses} expense(s), ${time} time, ${payouts} payout(s).`,
      warnings,
      projects,
      expenses,
      time,
      payouts,
    },
    next: state,
  };
}

export function mergeImport(current: LedgerState, parsed: ParsedImport): LedgerState {
  if (parsed.preview.kind === "ledger") return parsed.next;
  return parsed.next;
}
