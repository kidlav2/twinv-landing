import type { Metadata } from "next";
import { work } from "@/lib/content";
import { PageShell } from "@/components/page-shell";
import { Reveal } from "@/components/reveal";
import { ScrollPanel } from "@/components/scroll-panel";
import { ButtonPrimary } from "@/components/ui";
import { WorkViews } from "@/components/work-views";
import { indexTiles } from "@/lib/work";

export const metadata: Metadata = {
  title: "Work",
  description: work.sub,
};

/**
 * The portfolio index.
 *
 * It used to be a two-column grid of tall tiles: picture, kicker, title, a
 * summary sentence, tag — 735px of page per project, five projects, 3800px of
 * scroll. Every one of those blocks is defensible on its own and the stack of
 * them is not: an index is a thing you scan, and at a screen per entry there
 * is nothing to scan, only a slideshow you operate with the scroll wheel.
 *
 * Three changes, in order of how much height each one bought back:
 *
 *   - The summary sentence is gone. It was a worse copy of the opening
 *     paragraph on the case page, and it was four-fifths of the caption.
 *   - The masthead dropped from `display-xl` to `display`. `display-xl` is
 *     12.5vw — 168px on a monitor, and the size the homepage hero runs at. A
 *     subpage opening at hero scale claims the index is the most important
 *     screen on the site and pushes the first project under the fold.
 *   - The wide "feature" slot is gone with the grid it belonged to. It handed
 *     the full width to the first project whenever the count happened to be
 *     odd, which is arithmetic wearing the clothes of editorial judgement.
 *
 * What replaced it is two views of the same list, switched by the visitor —
 * see components/work-views.tsx for why there are two and why Ledger is the
 * default. Both are uncapped and unfiltered; a type filter is still the
 * natural next move past a dozen entries, and both views take one above the
 * list without changing anything below it.
 */
export default function WorkIndexPage() {
  const tiles = indexTiles();

  /* flushFooter: the closing panel ends on its own section padding, so the
     footer's default `pt-section` on top of it reads as an empty black band.
     footerCta: the closing panel below IS the "start a project" button — see
     the note on `cta` in components/footer.tsx. */
  return (
    <PageShell flushFooter footerCta={false} footerTone="dark">
      <section className="pt-[calc(var(--spacing-nav)+8px)] pb-section">
        <Reveal className="shell">
          <h1 className="reveal font-display max-w-[14ch] text-display">
            {work.headline}
          </h1>
          <p className="reveal text-muted mt-8 max-w-[42ch] text-lead">
            {work.sub}
          </p>
        </Reveal>
      </section>

      {/* Deliberately more than `pb-section-lg`, which every other section on
          the site uses. Two things land in this gap that do not land anywhere
          else: the Ledger's held frame is only released once the last row
          reaches the middle of the window, so it is still travelling upward
          when the section ends, and `ScrollPanel` grows the black card into a
          full-bleed band as it arrives. At the shared 128px the black was
          already widening while the last project was still being read. */}
      <section className="pb-[clamp(96px,26vw,264px)]">
        <Reveal className="shell">
          <WorkViews tiles={tiles} />
        </Reveal>
      </section>

      {/* The close is centred and runs the full width, rather than sitting in
          the left half the way the rest of the site's dark panels do. Those
          are sections with a page after them; this one is the end of the
          page, and a closing line pinned to the left edge of a black band
          with two-thirds of the band empty beside it reads as an unfinished
          layout rather than as a full stop. */}
      <ScrollPanel tone="dark" terminal cursor={false}>
        <section className="py-section-lg">
          <Reveal className="shell text-center">
            <h2 className="reveal font-display mx-auto max-w-[20ch] text-display">
              {work.close.headline}
            </h2>
            <p className="reveal text-muted mx-auto mt-10 max-w-[46ch] text-lead">
              {work.close.body}
            </p>
            <div className="reveal mt-14 flex justify-center">
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
