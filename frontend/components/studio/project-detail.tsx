"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useStudio, blankProject } from "@/lib/studio/store";
import type {
  Acquisition,
  ClientType,
  CurrencyCode,
  Expense,
  ExpenseCategory,
  FounderId,
  HybridBase,
  PaymentSchedule,
  Payout,
  PricingPreset,
  Project,
  ProjectStatus,
  SplitMethod,
  TaxMode,
  TimeEntry,
  WeightCategoryId,
} from "@/lib/studio/types";
import { computeWaterfall, paidTo, payoutStatus } from "@/lib/studio/calc";
import { parseDuration, formatHours } from "@/lib/studio/hours";
import { money } from "@/lib/studio/format";
import { nid } from "@/lib/studio/id";
import {
  EXPENSE_CATEGORIES,
  SPLIT_METHODS,
  TIME_NOTE,
  WEIGHT_CATEGORIES,
} from "@/lib/studio/constants";
import { alertCopy, includedUntil, maintenanceAlert } from "@/lib/studio/maintenance";
import { Field, FieldGrid, Select, TextInput } from "./fields";
import { AccountWarning, PageTitle, StatusPill, TaxNote } from "./widgets";
import { Waterfall } from "./waterfall";

const CURRENCIES: CurrencyCode[] = ["CAD", "USD", "EUR", "GBP"];

export function ProjectDetail({
  id,
  isNew,
}: {
  id?: string;
  isNew?: boolean;
}) {
  const { state, patchProject, removeProject } = useStudio();
  const router = useRouter();
  const existing = id ? state.projects.find((p) => p.id === id) : null;

  if (!isNew && !existing) {
    return <p className="text-muted">Project not found.</p>;
  }

  const project = existing!;
  const save = (patch: Partial<Project>, action: string, detail: string) => {
    if (isNew) return;
    patchProject(project.id, patch, action, detail);
  };

  return isNew ? (
    <NewProject />
  ) : (
        <LoadedProject
          key={project.id}
          project={project} save={save} onDelete={() => {
      if (confirm("Delete this project from the ledger?")) {
        removeProject(project.id);
        router.push("/studio/projects");
      }
    }} />
  );
}

function NewProject() {
  const { state, addProject } = useStudio();
  const router = useRouter();
  const [name, setName] = useState("");
  const [client, setClient] = useState("");
  const [price, setPrice] = useState(String(state.settings.businessPrice));
  const [preset, setPreset] = useState<PricingPreset>("business");

  return (
    <form
      className="flex max-w-xl flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        const settings = state.settings;
        const quoted =
          preset === "starter"
            ? settings.starterPrice
            : preset === "business"
              ? settings.businessPrice
              : preset === "premium"
                ? settings.premiumPrice
                : Number(price) || 0;
        const p = blankProject(settings);
        p.name = name || "Untitled project";
        p.client = client;
        p.quotedPrice = quoted;
        p.pricingPreset = preset;
        addProject(p);
        router.push(`/studio/projects/${p.id}`);
      }}
    >
      <PageTitle kicker="New">Project</PageTitle>
      <Field label="Project name">
        <TextInput value={name} onChange={(e) => setName(e.target.value)} required />
      </Field>
      <Field label="Client">
        <TextInput value={client} onChange={(e) => setClient(e.target.value)} />
      </Field>
      <Field label="Preset">
        <Select
          value={preset}
          onChange={(e) => {
            const v = e.target.value as PricingPreset;
            setPreset(v);
            if (v === "starter") setPrice(String(state.settings.starterPrice));
            if (v === "business") setPrice(String(state.settings.businessPrice));
            if (v === "premium") setPrice(String(state.settings.premiumPrice));
          }}
        >
          <option value="starter">Starter</option>
          <option value="business">Business</option>
          <option value="premium">Premium</option>
          <option value="custom">Custom</option>
        </Select>
      </Field>
      <Field label="Quoted price">
        <TextInput
          type="number"
          min={0}
          step="0.01"
          value={price}
          onChange={(e) => {
            setPrice(e.target.value);
            setPreset("custom");
          }}
        />
      </Field>
      <button type="submit" className="btn-primary rounded-btn min-h-11 cursor-pointer px-6 text-body">
        Create project
      </button>
    </form>
  );
}

function LoadedProject({
  project,
  save,
  onDelete,
}: {
  project: Project;
  save: (patch: Partial<Project>, action: string, detail: string) => void;
  onDelete: () => void;
}) {
  const { state } = useStudio();
  const trail = useMemo(() => computeWaterfall(project), [project]);
  const account = state.accounts.find((a) => a.id === project.accountId);
  const alert = maintenanceAlert(project.maintenance);
  const personal =
    account &&
    (account.kind === "personal_bank" || account.owner !== "studio");

  return (
    <div className="flex flex-col gap-10">
      <PageTitle
        kicker={project.client || "Project"}
        aside={
          <div className="flex flex-wrap gap-2">
            <StatusPill status={project.paymentStatus} />
            <StatusPill status={payoutStatus(trail.founderA, paidTo(project, "a"))} />
          </div>
        }
      >
        {project.name}
      </PageTitle>

      {alert ? (
        <p className="studio-card p-4 text-body-sm">{alertCopy(alert)}</p>
      ) : null}

      <section className="studio-card p-6">
        <h2 className="font-display text-heading-sm">Project</h2>
        <div className="mt-6">
          <FieldGrid>
            <Field label="Name">
              <TextInput
                defaultValue={project.name}
                onBlur={(e) => save({ name: e.target.value }, "update", `Name → ${e.target.value}`)}
              />
            </Field>
            <Field label="Client">
              <TextInput
                defaultValue={project.client}
                onBlur={(e) => save({ client: e.target.value }, "update", `Client → ${e.target.value}`)}
              />
            </Field>
            <Field label="Start date">
              <TextInput
                type="date"
                defaultValue={project.startDate}
                onBlur={(e) => save({ startDate: e.target.value }, "update", `Start date → ${e.target.value}`)}
              />
            </Field>
            <Field label="Status">
              <Select
                value={project.status}
                onChange={(e) =>
                  save({ status: e.target.value as ProjectStatus }, "update", `Status → ${e.target.value}`)
                }
              >
                {["draft", "active", "delivered", "maintenance", "closed"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
            </Field>
            <Field label="Client type">
              <Select
                value={project.clientType}
                onChange={(e) =>
                  save({ clientType: e.target.value as ClientType }, "update", `Client type → ${e.target.value}`)
                }
              >
                <option value="standard">Standard</option>
                <option value="founding">Founding client</option>
              </Select>
            </Field>
            <Field label="Preset">
              <Select
                value={project.pricingPreset}
                onChange={(e) => {
                  const pricingPreset = e.target.value as PricingPreset;
                  const quotedPrice =
                    pricingPreset === "starter"
                      ? state.settings.starterPrice
                      : pricingPreset === "business"
                        ? state.settings.businessPrice
                        : pricingPreset === "premium"
                          ? state.settings.premiumPrice
                          : project.quotedPrice;
                  save({ pricingPreset, quotedPrice }, "price", `Preset ${pricingPreset}`);
                }}
              >
                <option value="starter">Starter</option>
                <option value="business">Business</option>
                <option value="premium">Premium</option>
                <option value="custom">Custom</option>
              </Select>
            </Field>
          </FieldGrid>
        </div>
      </section>

      <section className="studio-card p-6">
        <h2 className="font-display text-heading-sm">Money in</h2>
        <div className="mt-6">
          <FieldGrid>
            <Field label="Quoted price">
              <TextInput
                type="number"
                min={0}
                step="0.01"
                defaultValue={project.quotedPrice}
                onBlur={(e) =>
                  save({ quotedPrice: Number(e.target.value) || 0 }, "price", `Quoted → ${e.target.value}`)
                }
              />
            </Field>
            <Field label="Invoice currency">
              <Select
                value={project.invoiceCurrency}
                onChange={(e) =>
                  save({ invoiceCurrency: e.target.value as CurrencyCode }, "update", `Invoice FX ${e.target.value}`)
                }
              >
                {CURRENCIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </Field>
            <Field label="Settlement currency">
              <Select
                value={project.settlementCurrency}
                onChange={(e) =>
                  save({ settlementCurrency: e.target.value as CurrencyCode }, "update", `Settlement ${e.target.value}`)
                }
              >
                {CURRENCIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </Field>
            <Field label="Expected FX rate" hint="1 invoice unit = this many settlement units. Leave empty if same currency.">
              <TextInput
                type="number"
                min={0}
                step="0.0001"
                defaultValue={project.expectedFxRate ?? ""}
                onBlur={(e) =>
                  save(
                    { expectedFxRate: e.target.value === "" ? null : Number(e.target.value) },
                    "update",
                    `FX rate → ${e.target.value || "none"}`,
                  )
                }
              />
            </Field>
            <Field label="Actual received" hint="What landed after bank conversion.">
              <TextInput
                type="number"
                min={0}
                step="0.01"
                defaultValue={project.actualReceived ?? ""}
                onBlur={(e) =>
                  save(
                    { actualReceived: e.target.value === "" ? null : Number(e.target.value) },
                    "update",
                    `Actual received → ${e.target.value || "none"}`,
                  )
                }
              />
            </Field>
            <Field label="Payment status">
              <Select
                value={project.paymentStatus}
                onChange={(e) =>
                  save({ paymentStatus: e.target.value as Project["paymentStatus"] }, "update", `Payment ${e.target.value}`)
                }
              >
                <option value="unpaid">Unpaid</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
              </Select>
            </Field>
            <Field label="Schedule">
              <Select
                value={project.paymentSchedule}
                onChange={(e) =>
                  save({ paymentSchedule: e.target.value as PaymentSchedule }, "update", `Schedule ${e.target.value}`)
                }
              >
                <option value="upfront">100% upfront</option>
                <option value="fifty_fifty">50 / 50</option>
                <option value="thirty_seventy">30 / 70</option>
                <option value="custom">Custom</option>
              </Select>
            </Field>
            <Field label="Payment account">
              <Select
                value={project.accountId ?? ""}
                onChange={(e) =>
                  save({ accountId: e.target.value || null }, "update", `Account → ${e.target.value}`)
                }
              >
                <option value="">—</option>
                {state.accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </Select>
            </Field>
          </FieldGrid>
        </div>
        {project.clientType === "founding" ? (
          <div className="mt-6">
            <FieldGrid>
              <Field label="Original price">
                <TextInput
                  type="number"
                  min={0}
                  step="0.01"
                  defaultValue={project.originalPrice ?? ""}
                  onBlur={(e) =>
                    save(
                      { originalPrice: e.target.value === "" ? null : Number(e.target.value) },
                      "price",
                      `Original price → ${e.target.value}`,
                    )
                  }
                />
              </Field>
              <Field label="Discount %">
                <TextInput
                  type="number"
                  min={0}
                  max={100}
                  step="0.1"
                  defaultValue={project.discountPct ?? ""}
                  onBlur={(e) =>
                    save(
                      { discountPct: e.target.value === "" ? null : Number(e.target.value) },
                      "price",
                      `Discount → ${e.target.value}%`,
                    )
                  }
                />
              </Field>
            </FieldGrid>
            {project.originalPrice != null ? (
              <p className="text-muted mt-4 text-body-sm">
                Portfolio investment{" "}
                {money(project.originalPrice - project.quotedPrice, project.invoiceCurrency)}
              </p>
            ) : null}
          </div>
        ) : null}
      {personal ? <div className="mt-6"><AccountWarning /></div> : null}
      {project.paymentStatus !== "paid" && project.actualReceived != null ? (
        <p className="text-muted mt-4 text-body-sm">
          Waterfall is on money received so far ({money(project.actualReceived, project.settlementCurrency)}), not the full quote.
        </p>
      ) : null}
      </section>

      <section className="studio-card p-6">
        <h2 className="font-display text-heading-sm">Reserves & fees</h2>
        <p className="text-muted mt-2 max-w-[56ch] text-body-sm">
          Set every rate yourself. The ledger never assumes a Canadian tax rate.
        </p>
        <div className="mt-6">
          <FieldGrid>
            <Field label="Gateway fee %">
              <TextInput
                type="number"
                min={0}
                step="0.01"
                defaultValue={project.gatewayFeePct}
                onBlur={(e) =>
                  save({ gatewayFeePct: Number(e.target.value) || 0 }, "update", `Gateway % → ${e.target.value}`)
                }
              />
            </Field>
            <Field label="Gateway fee fixed">
              <TextInput
                type="number"
                min={0}
                step="0.01"
                defaultValue={project.gatewayFeeFixed}
                onBlur={(e) =>
                  save({ gatewayFeeFixed: Number(e.target.value) || 0 }, "update", `Gateway fixed → ${e.target.value}`)
                }
              />
            </Field>
            <Field label="Studio reserve %">
              <TextInput
                type="number"
                min={0}
                max={100}
                step="0.1"
                defaultValue={project.studioReservePct}
                onBlur={(e) =>
                  save({ studioReservePct: Number(e.target.value) || 0 }, "update", `Studio reserve → ${e.target.value}%`)
                }
              />
            </Field>
            <Field label="GST/HST reserve %">
              <TextInput
                type="number"
                min={0}
                max={100}
                step="0.1"
                defaultValue={project.gstHstPct}
                onBlur={(e) =>
                  save({ gstHstPct: Number(e.target.value) || 0 }, "update", `GST/HST → ${e.target.value}%`)
                }
              />
            </Field>
            <Field label="Tax logic">
              <Select
                value={project.taxMode}
                onChange={(e) =>
                  save({ taxMode: e.target.value as TaxMode }, "update", `Tax mode → ${e.target.value}`)
                }
              >
                <option value="inclusive">Inclusive — tax sits inside the quoted price</option>
                <option value="exclusive">Exclusive — tax sits on top, transit only</option>
              </Select>
            </Field>
            <Field label="Income-tax reserve %">
              <TextInput
                type="number"
                min={0}
                max={100}
                step="0.1"
                defaultValue={project.incomeTaxReservePct}
                onBlur={(e) =>
                  save({ incomeTaxReservePct: Number(e.target.value) || 0 }, "update", `Income-tax reserve → ${e.target.value}%`)
                }
              />
            </Field>
            <Field label="Client acquisition">
              <Select
                value={project.acquisition}
                onChange={(e) =>
                  save({ acquisition: e.target.value as Acquisition }, "update", `Acquisition → ${e.target.value}`)
                }
              >
                <option value="a">{state.settings.founderAName}</option>
                <option value="b">{state.settings.founderBName}</option>
                <option value="organic">Organic</option>
                <option value="referral">Referral</option>
              </Select>
            </Field>
            <Field label="Sales commission %" hint="Of the amount after gateway fees. 0 for organic.">
              <TextInput
                type="number"
                min={0}
                max={100}
                step="0.1"
                defaultValue={project.salesCommissionPct}
                onBlur={(e) =>
                  save({ salesCommissionPct: Number(e.target.value) || 0 }, "update", `Commission → ${e.target.value}%`)
                }
              />
            </Field>
          </FieldGrid>
        </div>
        <div className="mt-4">
          <TaxNote />
        </div>
      </section>

      <Waterfall trail={trail} />

      <ContributionPanel project={project} save={save} />
      <TimePanel project={project} />
      <ExpensePanel project={project} />
      <PayoutPanel project={project} trailFounderA={trail.founderA} trailFounderB={trail.founderB} />
      <MaintenancePanel project={project} save={save} />
      <AuditPanel project={project} />

      <button
        type="button"
        className="text-muted hover:text-fg min-h-11 cursor-pointer self-start text-body-sm underline underline-offset-4"
        onClick={onDelete}
      >
        Delete project
      </button>
    </div>
  );
}

function ContributionPanel({
  project,
  save,
}: {
  project: Project;
  save: (patch: Partial<Project>, action: string, detail: string) => void;
}) {
  const trail = computeWaterfall(project);
  return (
    <section className="studio-card p-6">
      <h2 className="font-display text-heading-sm">Work contribution</h2>
      <p className="text-muted mt-2 max-w-[56ch] text-body-sm">{TIME_NOTE}</p>
      <div className="mt-6">
        <FieldGrid>
          <Field label="Distribution method">
            <Select
              value={project.splitMethod}
              onChange={(e) =>
                save({ splitMethod: e.target.value as SplitMethod }, "split", `Method → ${e.target.value}`)
              }
            >
              {SPLIT_METHODS.map((m) => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </Select>
          </Field>
          {project.splitMethod === "hybrid" ? (
            <Field label="Hybrid remainder">
              <Select
                value={project.hybridBase}
                onChange={(e) =>
                  save({ hybridBase: e.target.value as HybridBase }, "split", `Hybrid base → ${e.target.value}`)
                }
              >
                <option value="hours">Hours</option>
                <option value="weighted">Weighted</option>
                <option value="fixed">Fixed</option>
              </Select>
            </Field>
          ) : null}
          {(project.splitMethod === "fixed" ||
            (project.splitMethod === "hybrid" && project.hybridBase === "fixed")) ? (
            <Field label="Founder A fixed %">
              <TextInput
                type="number"
                min={0}
                max={100}
                defaultValue={project.fixedSplitA}
                onBlur={(e) =>
                  save({ fixedSplitA: Number(e.target.value) || 0 }, "split", `Fixed A → ${e.target.value}%`)
                }
              />
            </Field>
          ) : null}
        </FieldGrid>
      </div>
      <p className="text-muted mt-4 text-body-sm">
        Result {Math.round(trail.splitA * 100)}/{Math.round(trail.splitB * 100)} · pool{" "}
        {money(trail.poolA, trail.currency)} / {money(trail.poolB, trail.currency)}
        {trail.salesCredit > 0
          ? ` · sales credit ${money(trail.salesCredit, trail.currency)} to ${trail.salesRecipient === "a" ? "A" : "B"}`
          : ""}
      </p>
      {(project.splitMethod === "weighted" ||
        (project.splitMethod === "hybrid" && project.hybridBase === "weighted")) ? (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[32rem] text-left text-body-sm">
            <thead>
              <tr className="text-faint font-mono text-caption uppercase">
                <th className="pb-3 font-normal">Category</th>
                <th className="pb-3 font-normal">Weight</th>
                <th className="pb-3 font-normal">A 0–100</th>
                <th className="pb-3 font-normal">B 0–100</th>
              </tr>
            </thead>
            <tbody>
              {WEIGHT_CATEGORIES.map((c) => {
                const row = project.weighted[c.id];
                return (
                  <tr key={c.id} className="border-line border-t">
                    <td className="py-3">{c.label}</td>
                    {(["weight", "a", "b"] as const).map((key) => (
                      <td key={key} className="py-3 pr-3">
                        <TextInput
                          type="number"
                          min={0}
                          max={key === "weight" ? 10 : 100}
                          step={key === "weight" ? 0.5 : 1}
                          defaultValue={row[key]}
                          onBlur={(e) => {
                            const n = Number(e.target.value) || 0;
                            save(
                              {
                                weighted: {
                                  ...project.weighted,
                                  [c.id]: { ...row, [key]: n },
                                },
                              },
                              "split",
                              `${c.label} ${key} → ${n}`,
                            );
                          }}
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}

function TimePanel({ project }: { project: Project }) {
  const { patchProject } = useStudio();
  const [raw, setRaw] = useState("");
  const [founder, setFounder] = useState<FounderId>("a");
  const [role, setRole] = useState<WeightCategoryId | "other">("frontend");
  const parsed = parseDuration(raw);

  const add = () => {
    if (parsed == null) return;
    const entry: TimeEntry = {
      id: nid("t"),
      founder,
      date: new Date().toISOString().slice(0, 10),
      durationRaw: raw,
      hours: parsed,
      role,
      note: "",
    };
    patchProject(
      project.id,
      (p) => ({ ...p, timeEntries: [...p.timeEntries, entry] }),
      "time",
      `Added ${raw} (${formatHours(parsed)}) for ${founder.toUpperCase()}`,
    );
    setRaw("");
  };

  return (
    <section className="studio-card p-6">
      <h2 className="font-display text-heading-sm">Time</h2>
      <p className="text-muted mt-2 text-body-sm">{TIME_NOTE}</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_8rem_10rem_auto]">
        <Field label="Duration" hint="35m, 1h 20m, 1:20, or 1.5">
          <TextInput value={raw} onChange={(e) => setRaw(e.target.value)} placeholder="35m" />
        </Field>
        <Field label="Founder">
          <Select value={founder} onChange={(e) => setFounder(e.target.value as FounderId)}>
            <option value="a">A</option>
            <option value="b">B</option>
          </Select>
        </Field>
        <Field label="Role">
          <Select value={role} onChange={(e) => setRole(e.target.value as WeightCategoryId)}>
            {WEIGHT_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </Select>
        </Field>
        <div className="flex items-end">
          <button
            type="button"
            className="btn-primary rounded-btn min-h-11 w-full cursor-pointer px-4 text-body-sm"
            onClick={add}
            disabled={parsed == null}
          >
            Add {parsed != null ? formatHours(parsed) : ""}
          </button>
        </div>
      </div>
      <ul className="mt-6 flex flex-col gap-2">
        {project.timeEntries.map((t) => (
          <li key={t.id} className="text-muted flex justify-between gap-4 text-body-sm">
            <span>
              {t.date} · {t.founder.toUpperCase()} · {t.durationRaw} → {formatHours(t.hours)} · {t.role}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ExpensePanel({ project }: { project: Project }) {
  const { patchProject, state } = useStudio();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("software");
  const [paidBy, setPaidBy] = useState<Expense["paidBy"]>("studio");

  return (
    <section className="studio-card p-6">
      <h2 className="font-display text-heading-sm">Expenses</h2>
      <p className="text-muted mt-2 max-w-[56ch] text-body-sm">
        Payment processing is a system category: it comes off gross before shares.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Name">
          <TextInput value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Amount">
          <TextInput type="number" min={0} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </Field>
        <Field label="Category">
          <Select value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)}>
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </Select>
        </Field>
        <Field label="Paid by">
          <Select value={paidBy} onChange={(e) => setPaidBy(e.target.value as Expense["paidBy"])}>
            <option value="studio">Studio</option>
            <option value="a">{state.settings.founderAName}</option>
            <option value="b">{state.settings.founderBName}</option>
          </Select>
        </Field>
      </div>
      <button
        type="button"
        className="btn-ghost rounded-btn-sharp mt-4 min-h-11 cursor-pointer border-[1.5px] px-5 text-body-sm"
        onClick={() => {
          if (!name || !amount) return;
          const exp: Expense = {
            id: nid("ex"),
            name,
            category,
            amount: Number(amount) || 0,
            currency: project.settlementCurrency,
            paidBy,
            date: new Date().toISOString().slice(0, 10),
            note: "",
          };
          patchProject(
            project.id,
            (p) => ({ ...p, expenses: [...p.expenses, exp] }),
            "expense",
            `Added ${name} ${amount}`,
          );
          setName("");
          setAmount("");
        }}
      >
        Add expense
      </button>
      <ul className="mt-6 flex flex-col gap-2">
        {project.expenses.map((e) => (
          <li key={e.id} className="text-muted flex justify-between gap-4 text-body-sm">
            <span>
              {e.name} · {e.category.replace("_", " ")} · paid by {e.paidBy}
            </span>
            <span className="font-mono">{money(e.amount, e.currency)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function PayoutPanel({
  project,
  trailFounderA,
  trailFounderB,
}: {
  project: Project;
  trailFounderA: number;
  trailFounderB: number;
}) {
  const { patchProject, state } = useStudio();
  const [founder, setFounder] = useState<FounderId>("a");
  const [amount, setAmount] = useState("");
  const paidA = paidTo(project, "a");
  const paidB = paidTo(project, "b");

  return (
    <section className="studio-card p-6">
      <h2 className="font-display text-heading-sm">Payouts vs accruals</h2>
      <p className="text-muted mt-2 max-w-[56ch] text-body-sm">
        Accrued is the paper share. Paid is what actually moved.
      </p>
      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="studio-label">{state.settings.founderAName}</dt>
          <dd className="text-body">
            Accrued {money(trailFounderA, project.settlementCurrency)} · paid {money(paidA, project.settlementCurrency)} ·{" "}
            <StatusPill status={payoutStatus(trailFounderA, paidA)} />
          </dd>
        </div>
        <div>
          <dt className="studio-label">{state.settings.founderBName}</dt>
          <dd className="text-body">
            Accrued {money(trailFounderB, project.settlementCurrency)} · paid {money(paidB, project.settlementCurrency)} ·{" "}
            <StatusPill status={payoutStatus(trailFounderB, paidB)} />
          </dd>
        </div>
      </dl>
      <div className="mt-6 grid gap-4 sm:grid-cols-[8rem_1fr_auto]">
        <Field label="Founder">
          <Select value={founder} onChange={(e) => setFounder(e.target.value as FounderId)}>
            <option value="a">A</option>
            <option value="b">B</option>
          </Select>
        </Field>
        <Field label="Amount">
          <TextInput type="number" min={0} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </Field>
        <div className="flex items-end">
          <button
            type="button"
            className="btn-primary rounded-btn min-h-11 cursor-pointer px-5 text-body-sm"
            onClick={() => {
              if (!amount) return;
              const pay: Payout = {
                id: nid("po"),
                founder,
                amount: Number(amount) || 0,
                currency: project.settlementCurrency,
                date: new Date().toISOString().slice(0, 10),
                accountId: project.accountId,
                note: "",
              };
              patchProject(
                project.id,
                (p) => ({ ...p, payouts: [...p.payouts, pay] }),
                "payout",
                `Recorded ${amount} to ${founder.toUpperCase()}`,
              );
              setAmount("");
            }}
          >
            Record transfer
          </button>
        </div>
      </div>
    </section>
  );
}

function MaintenancePanel({
  project,
  save,
}: {
  project: Project;
  save: (patch: Partial<Project>, action: string, detail: string) => void;
}) {
  const m = project.maintenance;
  const until = includedUntil(m).toISOString().slice(0, 10);
  return (
    <section className="studio-card p-6">
      <h2 className="font-display text-heading-sm">Maintenance</h2>
      <p className="text-muted mt-2 text-body-sm">
        Three months included from the start date. Alerts fire at 30 / 14 / 7 days.
      </p>
      <div className="mt-6">
        <FieldGrid>
          <Field label="Included start">
            <TextInput
              type="date"
              defaultValue={m.startDate}
              onBlur={(e) =>
                save({ maintenance: { ...m, startDate: e.target.value } }, "update", `Maintenance start ${e.target.value}`)
              }
            />
          </Field>
          <Field label="Included months">
            <TextInput
              type="number"
              min={0}
              defaultValue={m.includedMonths}
              onBlur={(e) =>
                save(
                  { maintenance: { ...m, includedMonths: Number(e.target.value) || 0 } },
                  "update",
                  `Included months ${e.target.value}`,
                )
              }
            />
          </Field>
          <Field label="Monthly after (MRR)">
            <TextInput
              type="number"
              min={0}
              step="0.01"
              defaultValue={m.monthlyAmount}
              onBlur={(e) =>
                save(
                  { maintenance: { ...m, monthlyAmount: Number(e.target.value) || 0 } },
                  "update",
                  `MRR ${e.target.value}`,
                )
              }
            />
          </Field>
          <Field label="Tracking">
            <Select
              value={m.active ? "on" : "off"}
              onChange={(e) =>
                save({ maintenance: { ...m, active: e.target.value === "on" } }, "update", `Maintenance ${e.target.value}`)
              }
            >
              <option value="off">Off</option>
              <option value="on">On</option>
            </Select>
          </Field>
        </FieldGrid>
      </div>
      <p className="text-muted mt-4 text-body-sm">Included until {until}</p>
    </section>
  );
}

function AuditPanel({ project }: { project: Project }) {
  const { state } = useStudio();
  const name = (a: string) =>
    a === "a" ? state.settings.founderAName : a === "b" ? state.settings.founderBName : "System";
  return (
    <section className="studio-card p-6">
      <h2 className="font-display text-heading-sm">Audit</h2>
      <ol className="mt-6 flex flex-col gap-3">
        {project.audit.map((e) => (
          <li key={e.id} className="text-body-sm">
            <p className="text-fg">{e.detail}</p>
            <p className="text-faint font-mono mt-1 text-caption">
              {name(e.actor)} · {e.action} · {e.at.slice(0, 16).replace("T", " ")}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
