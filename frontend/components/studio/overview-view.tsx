"use client";

import Link from "next/link";
import { useStudio } from "@/lib/studio/store";
import { rollup } from "@/lib/studio/rollup";
import { money } from "@/lib/studio/format";
import { computeWaterfall, paidTo, payoutStatus } from "@/lib/studio/calc";
import { alertCopy } from "@/lib/studio/maintenance";
import { CrossBorderWarning, PageTitle, Stat, StatusPill } from "./widgets";
import { ImportPanel } from "./import-panel";

export function OverviewView() {
  const { state } = useStudio();
  const r = rollup(state);
  const cad = "CAD";

  return (
    <div className="flex flex-col gap-10">
      <PageTitle kicker="Admin" aside={<Link href="/studio/projects/new" className="btn-primary rounded-btn inline-flex min-h-11 cursor-pointer items-center px-5 text-body-sm">New project</Link>}>
        Ledger
      </PageTitle>

      <ImportPanel />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Received (settlement)" value={money(r.revenue, cad)} hint="Sum of actual received, not quoted." />
        <Stat label="Quoted" value={money(r.quoted, cad)} />
        <Stat label="Gateway fees" value={money(r.fees, cad)} />
        <Stat label="Studio reserve" value={money(r.studio, cad)} hint="Held in Twin V, not founder take-home." />
        <Stat label="Tax reserves" value={money(r.tax, cad)} hint="Planning set-asides only." />
        <Stat label="GST exclusive (sidecar)" value={money(r.gstSidecar, cad)} hint="Never entered the project pool." />
        <Stat label="Unpaid projects" value={String(r.unpaidProjects)} />
        <Stat
          label="Live MRR / ARR"
          value={`${money(r.mrr, cad)} / ${money(r.arr, cad)}`}
          hint="Counts after the included three months."
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <FounderSnap
          name={state.settings.founderAName}
          href="/studio/founders/a"
          accrued={r.accruedA}
          paid={r.paidA}
          unpaid={r.unpaidA}
        />
        <FounderSnap
          name={state.settings.founderBName}
          href="/studio/founders/b"
          accrued={r.accruedB}
          paid={r.paidB}
          unpaid={r.unpaidB}
        />
      </section>

      <CrossBorderWarning />

      {r.alerts.length > 0 ? (
        <section>
          <h2 className="font-display text-heading-sm">Maintenance</h2>
          <ul className="mt-4 flex flex-col gap-3">
            {r.alerts.map(({ project, alert }) => (
              <li key={project.id} className="studio-card p-5">
                <Link href={`/studio/projects/${project.id}`} className="text-fg cursor-pointer font-medium underline decoration-transparent underline-offset-4 hover:decoration-current">
                  {project.name}
                </Link>
                <p className="text-muted mt-2 text-body-sm">{alertCopy(alert)}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section>
        <h2 className="font-display text-heading-sm">Projects</h2>
        <ul className="mt-4 flex flex-col gap-3">
          {state.projects.map((p) => {
            const w = computeWaterfall(p);
            const a = payoutStatus(w.founderA, paidTo(p, "a"));
            const b = payoutStatus(w.founderB, paidTo(p, "b"));
            return (
              <li key={p.id}>
                <Link
                  href={`/studio/projects/${p.id}`}
                  className="studio-card hover:border-line-strong flex cursor-pointer flex-col gap-3 p-5 transition-colors sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-fg text-sub">{p.name}</p>
                    <p className="text-muted mt-1 text-body-sm">
                      {p.client} · {p.invoiceCurrency} {p.quotedPrice} → {p.settlementCurrency}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill status={p.paymentStatus} />
                    <StatusPill status={a} />
                    <StatusPill status={b} />
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

function FounderSnap({
  name,
  href,
  accrued,
  paid,
  unpaid,
}: {
  name: string;
  href: string;
  accrued: number;
  paid: number;
  unpaid: number;
}) {
  return (
    <Link href={href} className="studio-card block cursor-pointer p-6">
      <p className="studio-label">{name}</p>
      <p className="font-display text-heading-sm mt-2">{money(accrued, "CAD")}</p>
      <p className="text-muted mt-3 text-body-sm">
        Accrued {money(accrued, "CAD")} · paid {money(paid, "CAD")} · still due {money(unpaid, "CAD")}
      </p>
    </Link>
  );
}
