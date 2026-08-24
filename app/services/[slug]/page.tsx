import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { services } from "@/lib/content";
import { PageShell } from "@/components/page-shell";
import { Reveal } from "@/components/reveal";
import { ScrollPanel } from "@/components/scroll-panel";
import { ButtonPrimary, Tag } from "@/components/ui";
import { ServiceBlobs } from "@/components/service-blobs";
import { ServiceIncluded } from "@/components/service-included";
import { ServiceAsideVisual } from "@/components/service-aside-visual";

type Params = { slug: string };

/** One page per service, built statically at compile time — six known
 *  slugs, no need for on-demand generation. */
export function generateStaticParams(): Params[] {
  return services.items.map((s) => ({ slug: s.slug }));
}

function findService(slug: string) {
  return services.items.find((s) => s.slug === slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const service = findService((await params).slug);
  if (!service) return {};
  return { title: service.title, description: service.body };
}

/** A pointer, not an arrow. The `←` glyph is a hairline with a long stem and
 *  it sits on the text baseline, so beside 28px Anton it read as thin and low
 *  — the one piece of the page still wearing default UI furniture. */
function BackChevron() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[0.6em] w-[0.6em] shrink-0"
      aria-hidden
    >
      <path d="M15.5 4.5 8 12l7.5 7.5" />
    </svg>
  );
}

/** Marks the paragraph as an aside — "here is the thinking" — so it reads as
 *  a labelled block rather than a slab of text with no job. */
function ThoughtIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5 shrink-0"
      aria-hidden
    >
      <path d="M17.2 14.2a4.3 4.3 0 0 0-1.1-8.45 5.3 5.3 0 0 0-10.1 1.5 3.6 3.6 0 0 0 .4 6.95Z" />
      <circle cx="7.6" cy="18.4" r="1.5" />
      <circle cx="11.4" cy="21.1" r="0.9" />
    </svg>
  );
}

/**
 * Two zones, like the homepage: a light hero, then a black panel that widens
 * in over it and holds everything after — including the footer, which
 * PageShell paints to match.
 *
 * Deliberately absent, and why — these were built and taken back out:
 *   An `01 / 06` position counter. AGENTS.md rules index badges out as
 *     template filler, and the pager already answers "what else is there".
 *   The deliverables as bordered cards, and a hover state on them. They are
 *     full sentences, which this site sets as type separated by spacing (see
 *     Problem), and they were not links — inverting a static row on hover
 *     advertises an interaction that does not exist.
 */
export default async function ServicePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const service = findService((await params).slug);
  if (!service) notFound();

  const total = services.items.length;
  const index = services.items.findIndex((s) => s.slug === service.slug);
  const prev = services.items[(index - 1 + total) % total];
  const next = services.items[(index + 1) % total];

  return (
    /* flushFooter: the pager is full-bleed and meets the footer's first rule
       directly. footerTone: the last panel is the black one, so the footer
       continues that black instead of dropping back to canvas. */
    <PageShell flushFooter footerTone="dark">
      {/* `min-h` is short of the viewport ON PURPOSE — it leaves the top of
          the black panel visible below the fold. A first screen that ends on
          clean canvas gives no reason to scroll; a sliver of the next zone
          does the asking. */}
      <section className="min-h-[88svh] pt-[calc(var(--spacing-nav)+24px)] pb-section">
        <Reveal className="shell">
          <Link
            href="/#services"
            className="reveal font-display text-faint hover:text-fg inline-flex items-center gap-3 text-heading-sm transition-colors"
          >
            <BackChevron />
            All {services.headline}
          </Link>

          {/*
            The blobs are the backdrop the title is set ON, not a picture
            beside it.

            `isolate` + an explicit `bg-canvas` are both load-bearing for the
            blend. `mix-blend-difference` composites against whatever is
            painted beneath it inside the nearest isolated stacking context —
            so the container must own a background, or the type would blend
            against a transparent backdrop and come out white on the canvas.
            With canvas beneath, white type resolves to near-black off the
            blobs and to white over the black ones, which is the whole trick.

            Below `lg` the blend is off and the blobs drop into flow under the
            title: at that width the shapes would sit behind the standfirst
            too, and body copy is too fine to survive being differenced.
            `order` puts the title first there while keeping the blobs ahead
            of it in the DOM — paint order is what the blend depends on.
          */}
          <div className="relative isolate mt-10 flex flex-col bg-canvas lg:mt-14 lg:block lg:min-h-[540px]">
            <div className="order-2 mx-auto mt-10 w-full max-w-[420px] lg:absolute lg:top-1/2 lg:right-0 lg:order-none lg:mt-0 lg:w-[54%] lg:max-w-[620px] lg:-translate-y-1/2">
              <ServiceBlobs slug={service.slug} />
            </div>

            <h1 className="reveal font-display relative order-1 text-display-xl lg:mix-blend-difference lg:text-white">
              {service.title}
            </h1>

            <div className="relative order-3 mt-10 lg:mt-12 lg:max-w-[46%]">
              <p className="reveal text-fg max-w-[34ch] text-lead">
                {service.body}
              </p>
              <div className="reveal mt-8">
                <Tag>{service.meta}</Tag>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Everything from here down is the black zone, arriving as a rounded
          card that widens — the same device the homepage uses between its
          light and dark halves. `terminal` because nothing of another tone
          follows: no overhang, and the nav holds dark to the bottom. */}
      {/* `cursor={false}`: this zone already answers the pointer through the
          dot field beside the paragraph, and the homepage's whole-zone cursor
          invert on top of that is two effects competing for the same gesture. */}
      <ScrollPanel tone="dark" terminal cursor={false}>
        <section className="py-section">
          <Reveal className="shell">
            <div className="grid items-center gap-10 lg:grid-cols-12">
              {/* Decorative, so it is simply absent below `lg` — the empty
                  columns it fills only exist on a wide screen. */}
              <div className="hidden lg:col-span-4 lg:block">
                <ServiceAsideVisual />
              </div>

              <div className="lg:col-span-7 lg:col-start-6">
                <p className="reveal text-faint flex items-center gap-3 font-mono text-caption uppercase">
                  <ThoughtIcon />
                  Why this exists
                </p>
                <p className="reveal text-muted mt-6 max-w-[52ch] text-lead">
                  {service.intro}
                </p>
              </div>
            </div>
          </Reveal>
        </section>

        <section className="pb-section">
          <Reveal className="shell">
            {/* An h2 for structure, sized as a label: the big type in this
                section belongs to the deliverables themselves, and a second
                display heading above them would just be noise. Semantics and
                scale are separate decisions. */}
            <h2 className="reveal text-faint font-mono text-caption uppercase">
              What&rsquo;s included
            </h2>

            <div className="reveal mt-8">
              <ServiceIncluded items={service.included} />
            </div>

            <div className="reveal mt-14">
              <ButtonPrimary href="/#contact">Start a project</ButtonPrimary>
            </div>
          </Reveal>
        </section>

        {/* Prev/next pager — how you move between services without climbing
            back to the homepage grid, and the internal linking that makes six
            separate pages read as one set to a crawler. Wraps: from the last
            service, next is the first. `.pager-tile` rather than a
            `hover:bg-carbon` utility because the hover has to invert against
            the zone — black-on-black would be no hover at all in here. */}
        <nav aria-label="More services" className="border-line border-t">
          <div className="grid sm:grid-cols-2">
            <Link
              href={`/services/${prev.slug}`}
              className="pager-tile group border-line flex flex-col gap-3 border-b p-8 transition-colors duration-300 sm:border-r sm:border-b-0 sm:p-12"
            >
              <span className="pager-label text-faint font-mono text-caption uppercase transition-colors duration-300">
                ← Previous service
              </span>
              <span className="pager-title font-display text-fg text-heading transition-colors duration-300">
                {prev.title}
              </span>
            </Link>
            <Link
              href={`/services/${next.slug}`}
              className="pager-tile group flex flex-col items-start gap-3 p-8 text-left transition-colors duration-300 sm:items-end sm:p-12 sm:text-right"
            >
              <span className="pager-label text-faint font-mono text-caption uppercase transition-colors duration-300">
                Next service →
              </span>
              <span className="pager-title font-display text-fg text-heading transition-colors duration-300">
                {next.title}
              </span>
            </Link>
          </div>
        </nav>
      </ScrollPanel>
    </PageShell>
  );
}
