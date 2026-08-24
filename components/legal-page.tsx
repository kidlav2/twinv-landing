import { legal } from "@/lib/content";
import { PageShell } from "./page-shell";
import { Reveal } from "./reveal";

/**
 * Shared layout for /terms and /privacy — same document shape (title, one
 * intro paragraph, numbered sections), so one component renders both from
 * `lib/content.ts`'s `legal.terms` / `legal.privacy`.
 */
export function LegalPage({ doc }: { doc: (typeof legal)["terms"] }) {
  return (
    <PageShell>
      <section className="pt-[calc(var(--spacing-nav)+24px)] pb-section">
        <Reveal className="shell">
          <div className="max-w-[64ch]">
            <p className="text-faint font-mono text-caption uppercase">
              Updated {legal.updated}
            </p>
            <h1 className="font-display mt-6 text-display">{doc.title}</h1>
            <p className="text-fg mt-8 text-lead">{doc.intro}</p>

            <div className="border-line mt-14 flex flex-col divide-y divide-line border-t">
              {doc.sections.map((s, i) => (
                <div key={s.title} className="py-8">
                  <h2 className="text-faint font-mono text-caption uppercase">
                    {String(i + 1).padStart(2, "0")} — {s.title}
                  </h2>
                  <p className="text-muted mt-4 text-body">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>
    </PageShell>
  );
}
