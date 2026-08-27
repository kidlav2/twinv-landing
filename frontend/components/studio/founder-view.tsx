"use client";

import Link from "next/link";
import { useStudio } from "@/lib/studio/store";
import { rollup, founderExpenses } from "@/lib/studio/rollup";
import { computeWaterfall, paidTo, payoutStatus } from "@/lib/studio/calc";
import { money } from "@/lib/studio/format";
import type { FounderId } from "@/lib/studio/types";
import { CrossBorderWarning, PageTitle, Stat, StatusPill } from "./widgets";

export function FounderView({ id }: { id: FounderId }) {
  const { state } = useStudio();
  const r = rollup(state);
  const name = id === "a" ? state.settings.founderAName : state.settings.founderBName;
  const accrued = id === "a" ? r.accruedA : r.accruedB;
  const paid = id === "a" ? r.paidA : r.paidB;
  const unpaid = id === "a" ? r.unpaidA : r.unpaidB;
  const fronted = founderExpenses(state, id);
  const location = id === "a" ? "Canada" : "Outside Canada";
  const roles =
    id === "a"
      ? "UX/UI, frontend, motion, SEO, deploy, sales, client, PM, maintenance"
      : "Backend architecture, APIs, databases, auth, integrations";

  return (
    <div className="flex flex-col gap-10">
      <PageTitle kicker="Founder" aside={<StatusPill status={unpaid > 0.005 ? "partial" : "paid"} />}>
        {name}
      </PageTitle>
      <p className="text-muted max-w-[52ch] text-body-sm">
        {location}. {roles}. Studio ownership {id === "a" ? state.settings.ownershipA : state.settings.ownershipB}%
        is not the per-project split.
      </p>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Accrued" value={money(accrued, "CAD")} hint="Paper share across projects." />
        <Stat label="Paid out" value={money(paid, "CAD")} />
        <Stat label="Still due" value={money(unpaid, "CAD")} />
        <Stat label="Expenses fronted" value={money(fronted, "CAD")} hint="Personal spend to reimburse." />
      </section>

      <CrossBorderWarning />

      <section>
        <h2 className="font-display text-heading-sm">Projects</h2>
        <ul className="mt-4 flex flex-col gap-3">
          {state.projects.map((p) => {
            const w = computeWaterfall(p);
            const share = id === "a" ? w.founderA : w.founderB;
            const got = paidTo(p, id);
            return (
              <li key={p.id}>
                <Link
                  href={`/studio/projects/${p.id}`}
                  className="studio-card hover:border-line-strong flex cursor-pointer flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-fg">{p.name}</p>
                    <p className="text-muted text-body-sm">
                      {Math.round((id === "a" ? w.splitA : w.splitB) * 100)}% of pool
                      {w.salesRecipient === id ? " + sales credit" : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-body-sm">
                      {money(share, w.currency)} · paid {money(got, w.currency)}
                    </span>
                    <StatusPill status={payoutStatus(share, got)} />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
