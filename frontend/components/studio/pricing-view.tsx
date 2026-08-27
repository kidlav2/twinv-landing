"use client";

import { useMemo, useState } from "react";
import { useStudio } from "@/lib/studio/store";
import { requiredClientPrice } from "@/lib/studio/reverse";
import { money } from "@/lib/studio/format";
import { PageTitle, TaxNote } from "./widgets";
import { Field, FieldGrid, Select, TextInput } from "./fields";

export function PricingView() {
  const { state } = useStudio();
  const s = state.settings;
  const [desiredA, setDesiredA] = useState("900");
  const [desiredB, setDesiredB] = useState("900");
  const [feePct, setFeePct] = useState(String(s.defaultGatewayFeePct));
  const [feeFixed, setFeeFixed] = useState(String(s.defaultGatewayFeeFixed));
  const [expenses, setExpenses] = useState("0");
  const [gst, setGst] = useState(String(s.defaultGstHstPct));
  const [taxMode, setTaxMode] = useState<"inclusive" | "exclusive">(s.defaultTaxMode);
  const [sales, setSales] = useState(String(s.defaultSalesCommissionPct));
  const [salesOn, setSalesOn] = useState(true);
  const [income, setIncome] = useState(String(s.defaultIncomeTaxReservePct));
  const [studio, setStudio] = useState(String(s.defaultStudioReservePct));
  const [splitA, setSplitA] = useState("50");

  const result = useMemo(
    () =>
      requiredClientPrice(
        {
          desiredA: Number(desiredA) || 0,
          desiredB: Number(desiredB) || 0,
          feePct: Number(feePct) || 0,
          feeFixed: Number(feeFixed) || 0,
          expenses: Number(expenses) || 0,
          fxLoss: 0,
          gstPct: Number(gst) || 0,
          taxMode,
          salesPct: Number(sales) || 0,
          salesApplies: salesOn,
          incomeTaxPct: Number(income) || 0,
          studioReservePct: Number(studio) || 0,
        },
        (Number(splitA) || 0) / 100,
      ),
    [desiredA, desiredB, feePct, feeFixed, expenses, gst, taxMode, sales, salesOn, income, studio, splitA],
  );

  const cur = s.presetCurrency;

  return (
    <div className="flex flex-col gap-10">
      <PageTitle kicker="Scenario">How much should we charge?</PageTitle>
      <p className="text-muted max-w-[56ch] text-body-sm">
        Enter the take-home you want, then the same rates the ledger uses. The
        required client price is an internal estimate — not a tax quote.
      </p>

      <section className="studio-card p-6">
        <FieldGrid>
          <Field label={`${s.founderAName} take-home`}>
            <TextInput value={desiredA} onChange={(e) => setDesiredA(e.target.value)} />
          </Field>
          <Field label={`${s.founderBName} take-home`}>
            <TextInput value={desiredB} onChange={(e) => setDesiredB(e.target.value)} />
          </Field>
          <Field label="Pool split to A %">
            <TextInput value={splitA} onChange={(e) => setSplitA(e.target.value)} />
          </Field>
          <Field label="Gateway fee %">
            <TextInput value={feePct} onChange={(e) => setFeePct(e.target.value)} />
          </Field>
          <Field label="Gateway fixed">
            <TextInput value={feeFixed} onChange={(e) => setFeeFixed(e.target.value)} />
          </Field>
          <Field label="Project expenses">
            <TextInput value={expenses} onChange={(e) => setExpenses(e.target.value)} />
          </Field>
          <Field label="GST/HST reserve %">
            <TextInput value={gst} onChange={(e) => setGst(e.target.value)} />
          </Field>
          <Field label="Tax logic">
            <Select value={taxMode} onChange={(e) => setTaxMode(e.target.value as "inclusive" | "exclusive")}>
              <option value="inclusive">Inclusive</option>
              <option value="exclusive">Exclusive</option>
            </Select>
          </Field>
          <Field label="Sales commission %">
            <TextInput value={sales} onChange={(e) => setSales(e.target.value)} />
          </Field>
          <Field label="Sales credit on">
            <Select value={salesOn ? "yes" : "no"} onChange={(e) => setSalesOn(e.target.value === "yes")}>
              <option value="yes">Yes — closer is Founder A</option>
              <option value="no">No</option>
            </Select>
          </Field>
          <Field label="Income-tax reserve %">
            <TextInput value={income} onChange={(e) => setIncome(e.target.value)} />
          </Field>
          <Field label="Studio reserve %">
            <TextInput value={studio} onChange={(e) => setStudio(e.target.value)} />
          </Field>
        </FieldGrid>
      </section>

      <section className="studio-card p-8">
        <p className="studio-label">Required client price</p>
        <p className="font-display text-display mt-2">
          {result.reachable ? money(result.requiredGross, cur) : "—"}
        </p>
        <p className="text-muted mt-4 max-w-[48ch] text-body-sm">{result.note}</p>
        <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="studio-label">Fees</dt>
            <dd>{money(result.fees, cur)}</dd>
          </div>
          <div>
            <dt className="studio-label">GST/HST reserve</dt>
            <dd>{money(result.gstHst, cur)}</dd>
          </div>
          <div>
            <dt className="studio-label">Sales credit</dt>
            <dd>{money(result.salesCredit, cur)}</dd>
          </div>
          <div>
            <dt className="studio-label">Studio reserve</dt>
            <dd>{money(result.studioReserve, cur)}</dd>
          </div>
          <div>
            <dt className="studio-label">{s.founderAName} (implied)</dt>
            <dd>{money(result.impliedA, cur)}</dd>
          </div>
          <div>
            <dt className="studio-label">{s.founderBName} (implied)</dt>
            <dd>{money(result.impliedB, cur)}</dd>
          </div>
        </dl>
        <div className="mt-6">
          <TaxNote />
        </div>
      </section>

      <section>
        <h2 className="font-display text-heading-sm">Presets</h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-3">
          {[
            ["Starter", s.starterPrice],
            ["Business", s.businessPrice],
            ["Premium", s.premiumPrice],
          ].map(([label, price]) => (
            <li key={String(label)} className="studio-card p-5">
              <p className="studio-label">{String(label)}</p>
              <p className="font-display text-heading-sm mt-2">
                {money(Number(price), cur)}
              </p>
            </li>
          ))}
        </ul>
        <p className="text-faint mt-3 text-caption">
          Edit defaults in Settings. Founding-client discounts live on the project.
        </p>
      </section>
    </div>
  );
}
