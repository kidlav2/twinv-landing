"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { isDocumentVisible } from "@/lib/motion";
import { money } from "@/lib/studio/format";
import { formatHours } from "@/lib/studio/hours";
import type { Waterfall } from "@/lib/studio/calc";
import { TaxNote } from "./widgets";

gsap.registerPlugin(useGSAP);

export function Waterfall({ trail }: { trail: Waterfall }) {
  const scope = useRef<HTMLDivElement>(null);
  const gross = trail.gross || 1;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (!isDocumentVisible()) return;
        gsap.from(".studio-fall-row", {
          opacity: 0,
          y: 12,
          duration: 0.45,
          stagger: 0.05,
          ease: "power3.out",
        });
        gsap.from(".studio-fall-fill", {
          scaleX: 0,
          duration: 0.55,
          stagger: 0.05,
          ease: "power3.out",
        });
      });
      return () => mm.revert();
    },
    { scope, dependencies: [trail.gross, trail.projectPool, trail.founderA] },
  );

  return (
    <div ref={scope} className="studio-card p-6 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="studio-label">Money trail</p>
          <h2 className="font-display text-heading-sm mt-1">Gross to founders</h2>
        </div>
        <p className="text-muted text-body-sm max-w-[36ch]">
          Gross revenue is not personal income. The pool is what remains after
          fees, reserves, and credits.
        </p>
      </div>

      <ol className="mt-8 flex flex-col gap-4">
        {trail.steps.map((step) => {
          const width = Math.min(100, Math.max(0, (Math.abs(step.amount) / gross) * 100));
          const muted =
            step.kind === "deduction" ||
            step.kind === "reserve" ||
            step.kind === "sidecar";
          return (
            <li key={step.id} className="studio-fall-row">
              <div className="flex items-baseline justify-between gap-4">
                <p className={muted ? "text-muted text-body-sm" : "text-fg text-body"}>
                  {step.label}
                </p>
                <p className="font-mono text-body-sm tabular-nums">
                  {step.kind === "sidecar"
                  ? "→ "
                  : step.kind === "deduction" ||
                      step.kind === "reserve" ||
                      step.kind === "credit"
                    ? "− "
                    : ""}
                  {money(step.amount, trail.currency)}
                </p>
              </div>
              <div className="studio-fall-track mt-2">
                <span
                  className="studio-fall-fill"
                  style={{ width: `${width}%` }}
                />
              </div>
              {step.note ? (
                <p className="text-faint mt-1 text-caption">{step.note}</p>
              ) : null}
              {step.kind !== "payout" && step.kind !== "sidecar" ? (
                <p className="text-faint font-mono mt-1 text-caption tabular-nums">
                  Remaining {money(step.remaining, trail.currency)}
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>

      <dl className="border-line mt-8 grid gap-4 border-t pt-6 sm:grid-cols-3">
        <div>
          <dt className="studio-label">Gross revenue</dt>
          <dd className="font-display text-heading-sm">
            {money(trail.gross, trail.currency)}
          </dd>
        </div>
        <div>
          <dt className="studio-label">Project pool</dt>
          <dd className="font-display text-heading-sm">
            {money(trail.projectPool, trail.currency)}
          </dd>
        </div>
        <div>
          <dt className="studio-label">Personal compensation</dt>
          <dd className="font-display text-heading-sm">
            {money(trail.founderA + trail.founderB, trail.currency)}
          </dd>
        </div>
      </dl>

      <p className="text-muted mt-6 text-body-sm">
        Split {Math.round(trail.splitA * 100)}/{Math.round(trail.splitB * 100)} · {trail.splitLabel}
        {trail.hoursA + trail.hoursB > 0
          ? ` · ${formatHours(trail.hoursA)} / ${formatHours(trail.hoursB)}`
          : ""}
      </p>
      <div className="mt-3">
        <TaxNote />
      </div>
    </div>
  );
}
