"use client";

import { useState } from "react";
import { useStudio } from "@/lib/studio/store";
import type { AccountKind, AccountOwner, CurrencyCode, PaymentAccount } from "@/lib/studio/types";
import { nid } from "@/lib/studio/id";
import { AccountWarning, PageTitle } from "./widgets";
import { Field, FieldGrid, Select, TextInput } from "./fields";

const KINDS: { id: AccountKind; label: string }[] = [
  { id: "personal_bank", label: "Personal bank account" },
  { id: "business_bank", label: "Business bank account" },
  { id: "stripe", label: "Stripe" },
  { id: "paypal", label: "PayPal" },
  { id: "wise", label: "Wise" },
  { id: "other", label: "Other" },
];

export function AccountsView() {
  const { state, upsertAccount, removeAccount } = useStudio();
  const [name, setName] = useState("");
  const [kind, setKind] = useState<AccountKind>("stripe");
  const [owner, setOwner] = useState<AccountOwner>("studio");
  const [currency, setCurrency] = useState<CurrencyCode>("CAD");

  return (
    <div className="flex flex-col gap-10">
      <PageTitle kicker="Where money lands">Payment accounts</PageTitle>
      <AccountWarning />

      <ul className="grid gap-4 lg:grid-cols-2">
        {state.accounts.map((a) => (
          <li key={a.id} className="studio-card p-6">
            <p className="font-display text-heading-sm">{a.name}</p>
            <p className="text-muted mt-2 text-body-sm">
              {KINDS.find((k) => k.id === a.kind)?.label} · owner {ownerLabel(a.owner, state)} · {a.currency}
            </p>
            {a.notes ? <p className="text-faint mt-2 text-caption">{a.notes}</p> : null}
            <button
              type="button"
              className="text-muted hover:text-fg mt-4 min-h-11 cursor-pointer text-body-sm underline underline-offset-4"
              onClick={() => removeAccount(a.id)}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <section className="studio-card p-6">
        <h2 className="font-display text-heading-sm">Add account</h2>
        <div className="mt-6">
          <FieldGrid>
            <Field label="Name">
              <TextInput value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="Type">
              <Select value={kind} onChange={(e) => setKind(e.target.value as AccountKind)}>
                {KINDS.map((k) => (
                  <option key={k.id} value={k.id}>{k.label}</option>
                ))}
              </Select>
            </Field>
            <Field label="Owner">
              <Select value={owner} onChange={(e) => setOwner(e.target.value as AccountOwner)}>
                <option value="studio">Twin V Studio</option>
                <option value="a">{state.settings.founderAName}</option>
                <option value="b">{state.settings.founderBName}</option>
              </Select>
            </Field>
            <Field label="Currency">
              <Select value={currency} onChange={(e) => setCurrency(e.target.value as CurrencyCode)}>
                {["CAD", "USD", "EUR", "GBP"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </Field>
          </FieldGrid>
        </div>
        <button
          type="button"
          className="btn-primary rounded-btn mt-6 min-h-11 cursor-pointer px-5 text-body-sm"
          onClick={() => {
            if (!name) return;
            const account: PaymentAccount = {
              id: nid("acc"),
              name,
              kind,
              owner,
              currency,
              notes: "",
            };
            upsertAccount(account);
            setName("");
          }}
        >
          Add account
        </button>
      </section>
    </div>
  );
}

function ownerLabel(
  owner: AccountOwner,
  state: ReturnType<typeof useStudio>["state"],
) {
  if (owner === "studio") return "Twin V Studio";
  if (owner === "a") return state.settings.founderAName;
  return state.settings.founderBName;
}
