import type { Metadata } from "next";
import { work } from "@/lib/content";
import { PageShell } from "@/components/page-shell";
import { Reveal } from "@/components/reveal";
import { ScrollPanel } from "@/components/scroll-panel";
import { ButtonPrimary } from "@/components/ui";
import { WorkRow } from "@/components/work-card";

export const metadata: Metadata = {
  title: "Work",
  description: work.sub,
};

/**
 * The portfolio index.
 *
 * The homepage `#work` section keeps its scroller of compact cards; this page
 * is deliberately a different object rather than the same section on its own
 * URL. Full-width rows give each project the room the teaser cannot, and they
 * hold their shape whether there are three entries or ten — where a grid at
 * three leaves an orphan cell and implies every piece of work weighs the same.
 *
 * Light masthead, rows on canvas, then the black panel arrives for the close —
 * the same two-zone shape as a service page, so the two sets of subpages read
 * as one site.
 */
export default function WorkIndexPage() {
  return (
    <PageShell footerTone="dark">
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
          <div className="flex flex-col gap-6">
            {work.items.map((item) => (
              <WorkRow key={item.slug} item={item} />
            ))}
          </div>
        </Reveal>
      </section>

      <ScrollPanel tone="dark" terminal cursor={false}>
        <section className="py-section-lg">
          <Reveal className="shell">
            <h2 className="reveal font-display max-w-[18ch] text-heading-lg">
              Tell us what you need to move
            </h2>
            <p className="reveal text-muted mt-8 max-w-[46ch] text-lead">
              Send the URL and the number you want to change. We&rsquo;ll come
              back with an honest read on whether we can help.
            </p>
            <div className="reveal mt-12">
              <ButtonPrimary href="/#contact">Start a project</ButtonPrimary>
            </div>
          </Reveal>
        </section>
      </ScrollPanel>
    </PageShell>
  );
}
