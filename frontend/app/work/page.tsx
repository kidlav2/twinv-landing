import type { Metadata } from "next";
import { work } from "@/lib/content";
import { PageShell } from "@/components/page-shell";
import { Reveal } from "@/components/reveal";
import { ScrollPanel } from "@/components/scroll-panel";
import { ButtonPrimary } from "@/components/ui";
import { WorkTile } from "@/components/work-card";

export const metadata: Metadata = {
  title: "Work",
  description: work.sub,
};

/**
 * The portfolio index: pictures first, two to a row.
 *
 * It used to be a stack of full-width rows built around a metric set in
 * display type. That reads at three projects and collapses at ten — ten
 * screens of interchangeable numbers, each shouting as loudly as the page
 * heading, and not one photograph of the work. A tile has a fixed density
 * instead: ten projects are five rows, not ten screens.
 *
 * The one thing a two-column grid does badly is an odd count, which strands a
 * lone tile in the last row. So the first project takes the full width when
 * the count is odd, and the remainder is always even. Three → one wide plus a
 * pair; ten → five clean rows; twenty-one → one wide plus twenty. No layout
 * decision has to be revisited as work is added, and there is no hand-picked
 * "featured" list to keep honest — the wide slot is arithmetic.
 *
 * Deliberately uncapped and un-filtered. A type filter (Website / Growth /
 * Automation) is the natural next move somewhere past a dozen entries; the
 * tiles are uniform precisely so it can be dropped in above the grid without
 * touching them.
 *
 * Light masthead, tiles on canvas, then the black panel arrives for the close
 * — the same two-zone shape as a service page, so the two sets of subpages
 * read as one site.
 */
export default function WorkIndexPage() {
  const wideFirst = work.items.length % 2 === 1;

  /* flushFooter: the closing panel already ends on its own section padding, so
     the footer's default `pt-section` stacked on top of it reads as an empty
     black band between the page and the footer rather than as spacing. Every
     other route passes this; /work was the one that did not. */
  return (
    <PageShell flushFooter footerTone="dark">
      <section className="pt-[calc(var(--spacing-nav)+24px)] pb-section">
        <Reveal className="shell">
          <h1 className="reveal font-display max-w-[14ch] text-display-xl">
            {work.headline}
          </h1>
          <p className="reveal text-muted mt-10 max-w-[42ch] text-lead">
            {work.sub}
          </p>
        </Reveal>
      </section>

      <section className="pb-section">
        <Reveal className="shell">
          {/* The row gap is much larger than the column gap on purpose: a
              caption sits directly under its picture, so with equal gaps the
              tile below reads as part of the caption above it. */}
          <div className="grid gap-y-20 lg:grid-cols-2 lg:gap-x-12 lg:gap-y-28">
            {work.items.map((item, i) => {
              const feature = wideFirst && i === 0;
              return (
                <WorkTile
                  key={item.slug}
                  item={item}
                  feature={feature}
                  className={feature ? "lg:col-span-2" : ""}
                />
              );
            })}
          </div>
        </Reveal>
      </section>

      <ScrollPanel tone="dark" terminal cursor={false}>
        <section className="py-section-lg">
          <Reveal className="shell">
            <h2 className="reveal font-display max-w-[18ch] text-heading-lg">
              {work.close.headline}
            </h2>
            <p className="reveal text-muted mt-8 max-w-[46ch] text-lead">
              {work.close.body}
            </p>
            <div className="reveal mt-12">
              <ButtonPrimary href={work.close.cta.href}>
                {work.close.cta.label}
              </ButtonPrimary>
            </div>
          </Reveal>
        </section>
      </ScrollPanel>
    </PageShell>
  );
}
