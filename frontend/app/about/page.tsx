import type { Metadata } from "next";
import { about } from "@/lib/content";
import { PageShell } from "@/components/page-shell";
import { Reveal } from "@/components/reveal";
import { AboutPair } from "@/components/about-pair";
import { AboutStage } from "@/components/about-stage";
import { CardSwap, SwapCard } from "@/components/card-swap";
import { ServiceAsideVisual } from "@/components/service-aside-visual";
import { ScrollCue } from "@/components/scroll-cue";
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
      {/* ---------- Masthead: the contents spread ---------- */}
      {/* Tuned to land inside one screen rather than on the section-spacing
          tokens: measured at 1440x900 the token version ran 106px past the
          fold, which put the scroll cue — the one element whose whole job is
          to be seen at the bottom of the first screen — below it. */}
      <section
        id="about-studio"
        className="pt-[calc(var(--spacing-nav)+8px)] pb-6"
      >
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

              The title takes the whole shell rather than a 7-column half —
              measured at 1440px, 33 characters at 160px broke into five
              lines in half the width and pushed the contents rail and the
              laptop's peek off the first screen entirely. Across the full
              width it sets in two, which is what leaves room for the row
              below it. */}
          {/* `text-wrap: balance` evens the two lines out. Left to itself the
              headline filled the first line and dropped two words onto the
              second, which changed the shape of the block at every width and
              left a long ragged gap down the right. */}
          <h1 className="reveal font-display text-display-xl text-balance">
            {about.headline}
          </h1>

          <div className="mt-10 grid items-center gap-x-8 gap-y-10 lg:grid-cols-12">
            <p className="reveal text-fg max-w-[46ch] text-lead lg:col-span-5">
              {about.intro}
            </p>

            {/* Sized by viewport HEIGHT, not by its column. Width-driven, the
                square box grew as tall as the column was wide and the whole
                masthead stopped fitting on one screen — the big empty band
                between the title and the copy was that box's height with a
                short paragraph centred in it. Decorative, so simply absent
                below `lg`, same call as the service pages' aside. */}
            <div className="reveal hidden lg:col-span-6 lg:col-start-7 lg:block">
              <AboutPair className="flex h-[30vh] justify-end" />
            </div>
          </div>

          {/* Sits at the bottom of the first screen, pointing at the laptop. */}
          <ScrollCue className="reveal mt-9 hidden lg:block" />
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
                      behind, carbon on top. That is the documented role for
                      this colour — DESIGN.md's "Voltage Highlight … #fff100
                      background … on select elements" — and it is the one
                      thing in the dark zone that is neither white type nor
                      black ground. `inline` + `box-decoration-break: clone`
                      so a title that wraps gets a properly padded band on
                      every line instead of one box behind the lot. */}
                  <h3 className="font-display text-heading lg:col-span-5">
                    <span className="bg-voltage text-carbon box-decoration-clone px-3 py-1">
                      {point.title}
                    </span>
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
                      key={card.caption}
                      caption={card.caption}
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
