import type { Metadata } from "next";
import { about } from "@/lib/content";
import { PageShell } from "@/components/page-shell";
import { Reveal } from "@/components/reveal";
import { AboutPair } from "@/components/about-pair";
import { AboutStage } from "@/components/about-stage";
import { CardSwap, SwapCard } from "@/components/card-swap";
import { ServiceAsideVisual } from "@/components/service-aside-visual";
import { ButtonPrimary } from "@/components/ui";

export const metadata: Metadata = {
  title: "About",
  description: about.intro,
};

/**
 * Light masthead → the laptop opening into black → the rest of the page in
 * that black, down to the footer.
 *
 * No `ScrollPanel` here, unlike the service pages: the dark zone does not
 * arrive as a widening card, it arrives as the laptop's screen. Having both
 * would be two entrances for one transition, and two writers for the single
 * `data-nav-tone` slot. `AboutStage` owns that attribute on this page.
 */
export default function AboutPage() {
  return (
    <PageShell flushFooter footerTone="dark">
      {/* ---------- Masthead ----------
          Headline full-width on its own row, then a second row splitting
          lead copy from the shapes into separate GRID COLUMNS.

          That second point is a correction, not a style choice. An earlier
          pass made the shapes an absolutely-positioned backdrop the headline
          crossed, which needs `mix-blend-difference` to keep the crossing
          type legible — and that blend mode composites `::selection` too, so
          a reader dragging to select any of this text got the difference of
          voltage-yellow against canvas (a blue) instead of the site's actual
          selection colour. Columns make the overlap impossible in the first
          place, so nothing here has to fight `::selection` for a look. */}
      <section id="about-studio" className="pt-[calc(var(--spacing-nav)+8px)] pb-6">
        <Reveal className="shell">
          {/* No "About us" eyebrow. It was labelling the page from inside the
              page, which is the job of the nav — and the nav now marks the
              current route with `aria-current` and a rule, so a second
              "you are here" here would be saying it twice. */}

          {/* Full width, and `text-display-xl` rather than `text-display`.
              Both are corrections: every other page-level h1 on the site is
              display-xl (hero.tsx, services/[slug]), and this one being a
              step down inside a 46ch box was what left most of the canvas
              empty on a wide screen.

              The title takes the whole shell rather than a column — measured
              at 1440px, 33 characters at 160px broke into five lines in half
              the width. Across the full width it sets in two. Keeping it
              unconstrained (rather than sharing a row with the shapes) is
              what protects that two-line count: a shared row would have
              re-wrapped it into four or five short ones the moment the shapes
              column took half the width. */}
          {/* `text-wrap: balance` evens the two lines out. Left to itself the
              headline filled the first line and dropped two words onto the
              second, which changed the shape of the block at every width and
              left a long ragged gap down the right. */}
          {/* The voltage band moved up here from the points below, where three
              of them in a column had stopped being an accent. One phrase, once
              on the page, on the two words the whole site is an argument for.
              Marked rather than simply coloured because voltage type on canvas
              is #fff100 on #e5e5e5 — a colour you cannot read is not an
              accent. `box-decoration-clone` keeps every wrapped line padded.
              Padding in `em` so the band tracks the clamped display size
              instead of holding a 12px gap against 168px letters. */}
          <h1 className="reveal font-display text-display-xl text-balance">
            <span className="bg-voltage text-carbon box-decoration-clone px-[0.08em]">
              {about.headline.marked}
            </span>
            {about.headline.rest}
          </h1>

          {/* `items-start`, NOT `items-end`. Bottom-aligning the row sank the
              lead paragraph to the bottom of whatever height the shapes gave
              it — a screen's worth of blank canvas between the headline and
              its own standfirst, which read as the paragraph having gone
              missing. The paragraph belongs directly under the headline; it
              is the SHAPES that are pushed down, by their own margin, so only
              the decoration moves. */}
          <div className="mt-12 grid items-start gap-x-8 gap-y-12 lg:grid-cols-12">
            <p className="reveal text-fg max-w-[46ch] text-lead lg:col-span-5">
              {about.intro}
            </p>

            {/* Width-driven, not height-driven, and that is what keeps it
                inside its own column at every breakpoint. `AboutPair`'s box
                carries the artwork's own aspect ratio (see the component), so
                handing it a WIDTH lets it derive its height — it can never
                overflow sideways into the lead paragraph's column, which a
                height-driven box has no such guarantee against.

                Less than the column's full width, pushed to its right edge
                and down: the shapes are a note in the corner of the page, not
                the other half of a two-up layout. Decorative, so simply
                absent below `lg`, same call as the service pages' aside. */}
            <div className="reveal hidden lg:col-span-6 lg:col-start-7 lg:block">
              <AboutPair className="mt-10 ml-auto w-[74%] xl:mt-16" />
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------- The statement the laptop answers ----------
          Deliberately a `<p>`, not a heading. It is a line of copy set large,
          not a section title — the sections on this page each already have
          one, and adding a fourth to the outline for a block with no content
          under it would be describing the page wrongly to anything that reads
          the outline. Which also means `globals.css`'s automatic uppercasing
          of h1/h2/h3 does not reach it, hence the explicit `uppercase`.

          Both paddings are deliberately smaller than the section-spacing
          tokens, and the bottom one is gone: this line is the sentence the
          laptop answers, so the two belong in the same breath. The remaining
          daylight is `AboutStage`'s own headroom (`TOP_SHARE` there). */}
      <section className="pt-8 pb-0">
        <Reveal className="shell">
          {/* One line, deliberately. `text-display` set it in three, which
              read as a paragraph rather than a single beat — so this is a
              custom clamp rather than a type token: no token both fits 35
              characters of Anton across the shell and stays large enough to
              carry the moment. `3.8vw` keeps the line at roughly 57% of the
              shell at every width, which is why `nowrap` is safe rather than
              a promise of a horizontal scrollbar.

              Below `sm` it is allowed to wrap: the clamp floors at 24px there
              and a 35-character line does not fit a phone at any size worth
              reading. */}
          <p className="reveal font-display text-center text-[clamp(1.5rem,3.8vw,3.5rem)] uppercase sm:whitespace-nowrap">
            {about.prelude}
          </p>
        </Reveal>
      </section>

      {/* ---------- The set piece ---------- */}
      <AboutStage />

      {/* ---------- Everything below is the black the screen became ----------

          ONE painted wrapper, not one per section. Two adjacent sections each
          painting their own #000 is what produced the flickering pale seams
          while scrolling: `#smooth-content` is transformed to a sub-pixel
          offset, and the browser rounds each box independently, so the shared
          edge lands a fraction of a pixel apart and the canvas behind shows
          through. One background across the whole zone has no shared edge to
          get wrong. `.tone-dark` also belongs on the wrapper, since the roles
          it flips apply to everything inside. */}
      <div className="tone-dark bg-carbon">
        <section id="about-work" className="py-section-lg">
          <Reveal className="shell">
            {/* Only shown where the laptop is not — see the paired rules in
              globals.css. On the scripted path this same line is the text
              inside the screen, so it is never on screen twice. */}
            <h2 className="macbook-fallback font-display mb-16 max-w-[16ch] text-display">
              {about.claim}
            </h2>

            {/* The lead had five empty columns beside it. The dot field is
                the site's existing pointer-reactive decoration (it already
                sits beside the service pages' aside copy), so this fills the
                space with something that answers the cursor rather than with
                another block of type. Decorative, hence absent below `lg`. */}
            <div className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-8">
              <p className="reveal text-fg max-w-[52ch] text-lead lg:col-span-7">
                {about.body}
              </p>
              <div className="reveal hidden justify-self-end lg:col-span-4 lg:col-start-9 lg:block">
                <ServiceAsideVisual />
              </div>
            </div>

            {/* Rows, not cards, and no hairlines between them — three short
              statements do not need a container each, and the divider-between-
              grid-items pattern is the template filler AGENTS.md pulled out of
              Problem/Pillars/Services. Space does the separating. */}
            <div className="mt-24 flex flex-col gap-16 lg:gap-20">
              {about.points.map((point) => (
                <div
                  key={point.title}
                  className="reveal grid gap-4 lg:grid-cols-12 lg:gap-8"
                >
                  {/* Marked the way a mouse selection marks text: voltage
                      behind, carbon on top. DESIGN.md's documented role for
                      this colour ("Voltage Highlight … #fff100 background … on
                      select elements") — and "select" is the operative word,
                      so exactly one of the three carries it and the other two
                      are plain white type. `box-decoration-break: clone` gives
                      a wrapped title a padded band per line rather than one
                      box behind the lot. */}
                  <h3 className="font-display text-heading lg:col-span-5">
                    {point.marked ? (
                      <span className="bg-voltage text-carbon box-decoration-clone px-3 py-1">
                        {point.title}
                      </span>
                    ) : (
                      point.title
                    )}
                  </h3>
                  <p className="text-muted max-w-[52ch] text-sub lg:col-span-6 lg:col-start-7">
                    {point.body}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* ---------- The two of us ----------
          `overflow-x-clip` is what lets the card stack run off the right edge
          of the screen without handing the whole page a horizontal scrollbar.
          Same device as the MacBook image on the homepage (product.tsx). */}
        <section id="about-us" className="overflow-x-clip pb-section-lg">
          <Reveal className="shell">
            <div className="grid items-center gap-16 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-6">
                <p className="reveal text-faint font-mono text-caption uppercase">
                  {about.founders.eyebrow}
                </p>
                <h2 className="reveal font-display mt-6 text-display">
                  {about.founders.headline}
                </h2>
                <p className="reveal text-muted mt-8 max-w-[46ch] text-sub">
                  {about.founders.body}
                </p>

                <div className="reveal mt-10">
                  <ButtonPrimary href={about.cta.href}>
                    {about.cta.label}
                  </ButtonPrimary>
                </div>
              </div>

              {/* The cards are absolutely positioned inside this box, so it has
                to carry its own height. The translate pushes the stack past
                the right edge of the screen — the section clips the overflow,
                so the cards read as continuing off-frame rather than being
                politely contained. */}
              <div className="reveal lg:col-span-6 lg:col-start-7">
                <CardSwap className="h-[440px] sm:h-[560px] lg:h-[600px] lg:translate-x-[24%] xl:h-[680px] xl:translate-x-[28%]">
                  {about.founders.cards.map((card) => (
                    <SwapCard
                      key={card.name}
                      name={card.name}
                      role={card.role}
                      className="h-[340px] w-[260px] sm:h-[480px] sm:w-[360px] lg:h-[560px] lg:w-[440px] xl:h-[640px] xl:w-[520px]"
                    />
                  ))}
                </CardSwap>
              </div>
            </div>
          </Reveal>
        </section>
      </div>
    </PageShell>
  );
}
