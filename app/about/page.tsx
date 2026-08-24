import type { Metadata } from "next";
import { about, product } from "@/lib/content";
import { PageShell } from "@/components/page-shell";
import { Reveal } from "@/components/reveal";
import { ButtonPrimary } from "@/components/ui";

export const metadata: Metadata = {
  title: "About",
  description: about.intro,
};

/**
 * Static — no scroll-driven motion of its own, only `Reveal`'s entrance
 * batch. The homepage earns its GSAP budget with a long scroll and several
 * zones; a single-screen page about two people doesn't need its own set
 * piece, and AGENTS.md's restraint principle (no badge/stat-row filler)
 * applies here as much as it did to the hero.
 */
export default function AboutPage() {
  return (
    <PageShell>
      <section className="pt-[calc(var(--spacing-nav)+24px)] pb-section">
        <Reveal className="shell">
          <div className="max-w-[46ch]">
            <p className="reveal text-faint font-mono text-caption uppercase">
              {about.eyebrow}
            </p>
            <h1 className="reveal font-display mt-6 text-display">
              {about.headline}
            </h1>
            <p className="reveal text-fg mt-8 text-lead">{about.intro}</p>
            <p className="reveal text-muted mt-6 text-sub">{about.body}</p>
          </div>

          {/* Same visual idiom as Stack's group labels + chips: a mono
              uppercase label over a short list, rather than a card grid —
              three sentences don't need a card's weight. */}
          <div className="reveal mt-16 grid gap-10 sm:grid-cols-3 sm:gap-8">
            {about.points.map((point) => (
              <div key={point.title}>
                <h2 className="font-display text-heading-sm">{point.title}</h2>
                <p className="text-muted mt-3 text-body-sm">{point.body}</p>
              </div>
            ))}
          </div>

          {/* The same claim Product makes on the homepage, in the place
              someone lands specifically to hear it made in full. */}
          <p className="reveal border-line mt-16 max-w-[46ch] border-t pt-8 text-sub text-muted">
            {product.body[0]}
          </p>

          <div className="reveal mt-10">
            <ButtonPrimary href={about.cta.href}>
              {about.cta.label}
            </ButtonPrimary>
          </div>
        </Reveal>
      </section>
    </PageShell>
  );
}
