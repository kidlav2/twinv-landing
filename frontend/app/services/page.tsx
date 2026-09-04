import type { Metadata } from "next";
import { services } from "@/lib/content";
import { PageShell } from "@/components/page-shell";
import { Reveal } from "@/components/reveal";
import { ScrollPanel } from "@/components/scroll-panel";
import { ButtonPrimary } from "@/components/ui";
import { ServicesGrid } from "@/components/services-grid";

export const metadata: Metadata = {
  title: "Services",
  description: services.sub,
};

/**
 * The services index — the door `/services` was missing.
 *
 * Until now the nav's "Services" pointed straight at `/services/website-design`,
 * because there was no index and a bare `#services` hash sitting next to real
 * routes made the bar feel broken. That put a visitor who wanted to see what
 * the studio does inside one specific service, with the other five reachable
 * only from the pager at the bottom of it. The note in lib/content.ts said to
 * change the href when an index shipped; this is it.
 *
 * It reuses `ServicesGrid` outright rather than restating the six cards. That
 * is not laziness about markup — it is the reason the sliding black block, the
 * marks, the focus handling and the no-JS fallback all behave identically in
 * both places. Two copies of a grid this stateful would drift within a month.
 *
 * What the index adds over the homepage section is a masthead at display size
 * and a close. The homepage section is a teaser with the brief form directly
 * under it and needs neither; this page is the whole answer to "what do you
 * do", so it opens like one and ends on the one action it can offer.
 *
 * Deliberately short — masthead, six cards, close. Every service already has a
 * full page of its own, and an index that restates their contents is a page
 * you scroll past to reach the page you wanted.
 */
export default function ServicesIndexPage() {
  /* Same pair as /work, and for the same reasons: the closing panel ends on
     its own padding, and it already IS the "start a project" button, so the
     footer's copy of it would be the second identical yellow pill in a
     screen. See the note on `cta` in components/footer.tsx. */
  return (
    <PageShell flushFooter footerCta={false} footerTone="dark">
      {/* Masthead and grid share ONE section. Split across two they each
          brought their own vertical padding and `ServicesGrid` added its own
          `mt-12` on top, which stacked into 145px of nothing between the
          sub-copy and the first card — the section spacing of a page break,
          inside what is one block. */}
      <section className="pt-[calc(var(--spacing-nav)+8px)] pb-section-lg">
        <Reveal className="shell">
          <h1 className="reveal font-display max-w-[14ch] text-display">
            {services.headline}
          </h1>
          <p className="reveal text-muted mt-8 max-w-[42ch] text-lead">
            {services.sub}
          </p>
          <ServicesGrid />
        </Reveal>
      </section>

      <ScrollPanel tone="dark" terminal cursor={false}>
        <section className="py-section-lg">
          <Reveal className="shell text-center">
            <h2 className="reveal font-display mx-auto max-w-[20ch] text-display">
              {services.close.headline}
            </h2>
            <p className="reveal text-muted mx-auto mt-10 max-w-[46ch] text-lead">
              {services.close.body}
            </p>
            <div className="reveal mt-14 flex justify-center">
              <ButtonPrimary href={services.close.cta.href}>
                {services.close.cta.label}
              </ButtonPrimary>
            </div>
          </Reveal>
        </section>
      </ScrollPanel>
    </PageShell>
  );
}
