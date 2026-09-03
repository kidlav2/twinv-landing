import Link from "next/link";
import { legal } from "@/lib/content";
import { PageShell } from "./page-shell";
import { Reveal } from "./reveal";
import { LegalToc } from "./legal-toc";

type LegalSection = {
  id: string;
  title: string;
  body: string[];
  list?: string[];
  after?: string[];
};

export type LegalDoc = {
  title: string;
  kicker: string;
  intro: string;
  highlights: string[];
  sections: LegalSection[];
};

/**
 * Shared layout for /terms and /privacy — same document shape, so one
 * component renders both from `lib/content.ts`.
 *
 * The page is a document, not a marketing section, and it is laid out like
 * one: masthead, then a two-column reading spread — sticky section rail on
 * the left, clauses on the right. Before this it was a single 64ch column
 * with six identical paragraphs stacked behind hairlines, which on a wide
 * screen left two thirds of the viewport empty and gave a reader no way to
 * reach clause four except by scrolling past one, two, and three.
 *
 * Measure stays at ~68ch on the body copy even though the column is wider —
 * the extra width buys the rail and the numbering, not longer lines.
 *
 * Numbering is deliberate here and is not the section-index pattern AGENTS.md
 * removed from Problem/Pillars/Services. On those it decorated; on a legal
 * document the numbers are how a clause is cited, and the `id` anchors are
 * part of the same contract — /terms#the-brief-form has to keep working.
 */
export function LegalPage({ doc }: { doc: LegalDoc }) {
  const other =
    doc.title === legal.terms.title
      ? { href: "/privacy", title: legal.privacy.title }
      : { href: "/terms", title: legal.terms.title };

  return (
    <PageShell>
      {/* Masthead */}
      <section className="pt-[calc(var(--spacing-nav)+24px)]">
        <Reveal className="shell">
          <div className="border-line reveal flex items-baseline justify-between gap-6 border-b pb-4">
            <p className="text-faint font-mono text-caption uppercase">
              {doc.kicker}
            </p>
            <p className="text-faint font-mono text-caption uppercase">
              Updated {legal.updated}
            </p>
          </div>

          <h1 className="reveal font-display mt-8 text-display">{doc.title}</h1>

          <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-12 lg:gap-8">
            <p className="reveal text-fg max-w-[52ch] text-lead lg:col-span-7">
              {doc.intro}
            </p>

            {/* At a glance. `paper` on `canvas` is the only depth the system
                allows — surface contrast, no shadow and no border needed. */}
            <aside className="reveal bg-paper rounded-card p-8 lg:col-span-4 lg:col-start-9">
              <p className="text-faint font-mono text-caption uppercase">
                At a glance
              </p>
              <ul className="mt-5 flex flex-col gap-4">
                {doc.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-3">
                    <span
                      className="bg-voltage mt-[0.45em] size-2 shrink-0"
                      aria-hidden
                    />
                    <span className="text-fg text-body-sm">{h}</span>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </Reveal>
      </section>

      {/* Clauses */}
      <section className="pt-14 pb-section lg:pt-20">
        <Reveal className="shell">
          <div data-legal-grid className="lg:grid lg:grid-cols-12 lg:gap-8">
            {/* col-span stays on this wrapper so GSAP's pin cannot steal the
                column — the same guard the case timeline uses. */}
            <div className="hidden lg:col-span-3 lg:block">
              <div>
                <LegalToc
                  sections={doc.sections.map((s) => ({
                    id: s.id,
                    title: s.title,
                  }))}
                />
              </div>
            </div>

            <div className="lg:col-span-8 lg:col-start-5">
              {doc.sections.map((s, i) => (
                <article
                  key={s.id}
                  id={s.id}
                  className="border-line scroll-mt-[calc(var(--nav-height)+24px)] border-t py-10 first:border-t-0 first:pt-0 lg:py-12 lg:first:pt-0"
                >
                  <div className="reveal flex items-baseline gap-4">
                    <span className="text-faint font-mono text-caption">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h2 className="font-display text-fg text-heading-sm">
                      {s.title}
                    </h2>
                  </div>

                  <div className="reveal mt-5 flex max-w-[68ch] flex-col gap-4">
                    {/* 1.55 rather than the token's 1.25. That value is set
                        for short marketing paragraphs; a clause that runs four
                        lines needs the extra leading to stay readable, and the
                        same reasoning already put 1.45 on body-sm elsewhere. */}
                    {s.body.map((p) => (
                      <p
                        key={p}
                        className="text-muted text-pretty text-body leading-[1.55]"
                      >
                        {p}
                      </p>
                    ))}

                    {s.list && (
                      <ul className="mt-1 flex flex-col gap-3">
                        {s.list.map((item) => (
                          <li key={item} className="flex items-start gap-3">
                            <span
                              className="bg-ash mt-[0.75em] h-px w-4 shrink-0"
                              aria-hidden
                            />
                            <span className="text-muted text-body leading-[1.55]">
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {s.after?.map((p) => (
                      <p
                        key={p}
                        className="text-muted mt-1 text-pretty text-body leading-[1.55]"
                      >
                        {p}
                      </p>
                    ))}
                  </div>
                </article>
              ))}

              {/* Close: the one action either document ever asks for, plus the
                  door to its counterpart. `.tone-light` is not needed — this
                  card is dark inside a light zone, so it sets the dark roles
                  itself via explicit colours rather than inheriting them. */}
              <div className="border-line grid gap-4 border-t pt-10 sm:grid-cols-2 lg:pt-12">
                <div className="bg-carbon text-paper rounded-card p-8">
                  <p className="font-mono text-caption uppercase opacity-50">
                    Questions
                  </p>
                  <a
                    href={`mailto:${legal.contactEmail}`}
                    className="font-display text-mint mt-3 block text-heading-sm break-all underline decoration-transparent underline-offset-4 transition-colors duration-200 hover:decoration-current"
                  >
                    {legal.contactEmail}
                  </a>
                </div>

                <Link
                  href={other.href}
                  className="border-line hover:border-fg rounded-card flex flex-col justify-between border p-8 transition-colors duration-200"
                >
                  <p className="text-faint font-mono text-caption uppercase">
                    Also read →
                  </p>
                  <p className="font-display text-fg mt-3 text-heading-sm">
                    {other.title}
                  </p>
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </PageShell>
  );
}
