"use client";

import Link from "next/link";
import { useStudio } from "@/lib/studio/store";
import { computeWaterfall, paidTo, payoutStatus } from "@/lib/studio/calc";
import { money, pctLabel } from "@/lib/studio/format";
import { PageTitle, StatusPill } from "./widgets";

export function ProjectsView() {
  const { state } = useStudio();

  return (
    <div className="flex flex-col gap-8">
      <PageTitle
        kicker="Work"
        aside={
          <Link
            href="/studio/projects/new"
            className="btn-primary rounded-btn inline-flex min-h-11 cursor-pointer items-center px-5 text-body-sm"
          >
            New project
          </Link>
        }
      >
        Projects
      </PageTitle>

      <ul className="flex flex-col gap-4">
        {state.projects.map((p) => {
          const w = computeWaterfall(p);
          return (
            <li key={p.id}>
              <Link
                href={`/studio/projects/${p.id}`}
                className="studio-card hover:border-line-strong grid cursor-pointer gap-6 p-6 transition-colors lg:grid-cols-[1.2fr_1fr]"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-heading-sm">{p.name}</h2>
                    <StatusPill status={p.paymentStatus} />
                    {p.clientType === "founding" ? (
                      <span className="bg-mint text-carbon font-mono rounded-tag px-3 py-1 text-caption uppercase">
                        Founding
                      </span>
                    ) : null}
                  </div>
                  <p className="text-muted mt-2 text-body-sm">
                    {p.client} · {p.status} · {p.pricingPreset}
                  </p>
                  {p.clientType === "founding" && p.originalPrice ? (
                    <p className="text-faint mt-2 text-caption">
                      Portfolio investment {money((p.originalPrice - p.quotedPrice), p.invoiceCurrency)}
                      {p.discountPct != null ? ` · ${pctLabel(p.discountPct)} off` : ""}
                    </p>
                  ) : null}
                </div>
                <dl className="grid grid-cols-2 gap-3 text-body-sm">
                  <div>
                    <dt className="text-faint">Quoted</dt>
                    <dd>{money(p.quotedPrice, p.invoiceCurrency)}</dd>
                  </div>
                  <div>
                    <dt className="text-faint">Pool</dt>
                    <dd>{money(w.projectPool, w.currency)}</dd>
                  </div>
                  <div>
                    <dt className="text-faint">{state.settings.founderAName}</dt>
                    <dd>
                      {money(w.founderA, w.currency)} · {payoutStatus(w.founderA, paidTo(p, "a"))}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-faint">{state.settings.founderBName}</dt>
                    <dd>
                      {money(w.founderB, w.currency)} · {payoutStatus(w.founderB, paidTo(p, "b"))}
                    </dd>
                  </div>
                </dl>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
