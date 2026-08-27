import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { work } from "@/lib/content";
import { PageShell } from "@/components/page-shell";
import { Reveal } from "@/components/reveal";
import { ScrollPanel } from "@/components/scroll-panel";
import { ButtonPrimary, SectionLabel, Tag } from "@/components/ui";
import { WorkStill } from "@/components/work-still";

type Params = { slug: string };
type Project = (typeof work.items)[number];

export function generateStaticParams(): Params[] {
  return work.items.map((p) => ({ slug: p.slug }));
}

function findProject(slug: string): Project | undefined {
  return work.items.find((p) => p.slug === slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const project = findProject((await params).slug);
  if (!project) return {};
  return { title: project.title, description: project.summary };
}

/** Same pointer the service pages use — the `←` glyph is too thin and sits
 *  too low beside display type. */
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

/**
 * One case, in the only three beats a buyer needs: what was wrong, what we
 * decided, what changed.
 *
 * What this page deliberately does NOT contain is a description of how the
 * studio works. A methodology block (discovery → design → build → launch) is
 * the same on every project by definition, which makes it an ad for process
 * rather than evidence about this piece of work — and the visitor reading a
 * case study is a buyer, not a candidate. The sequence here is specific: this
 * problem, these three decisions, this result.
 *
 * Section order is carried by the mono labels, not by `01 / 02 / 03` markers.
 * AGENTS.md rules index badges out as template filler, and the labels already
 * say which beat you are in.
 */
export default async function ProjectPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const project = findProject((await params).slug);
  if (!project) notFound();

  const total = work.items.length;
  const index = work.items.findIndex((p) => p.slug === project.slug);
  const prev = work.items[(index - 1 + total) % total];
  const next = work.items[(index + 1) % total];

  // Self-initiated work leads with that fact instead of its sector. See the
  // rules on `kind` in lib/content.ts — this is the one label that must never
  // be softened, because it is the claim a visitor can check from outside.
  const lead = project.kind === "self" ? "Self-initiated" : project.sector;
  const facts = [project.metric, ...project.outcomeFacts];

  return (
    <PageShell flushFooter footerTone="dark">
      {/* Short of the viewport on purpose: a sliver of the black panel below
          the fold is what asks for the scroll. Same as the service pages. */}
      <section className="min-h-[88svh] overflow-x-clip pt-[calc(var(--spacing-nav)+24px)] pb-section">
        <Reveal className="shell">
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-5">
              <Link
                href="/work"
                className="reveal font-display text-faint hover:text-fg inline-flex items-center gap-3 text-heading-sm transition-colors"
              >
                <BackChevron />
                {work.more}
              </Link>

              <p className="reveal text-faint mt-12 font-mono text-caption uppercase">
                {lead} · {project.year}
                {project.client ? ` · ${project.client}` : ""}
              </p>

              {/* `text-heading-lg` beside the still, not `text-display`.
                  Display is a full-width sentence size; in five columns it
                  wrapped the claim into a stack and crowded the picture out.
                  The still is the loud element on this screen now. */}
              <h1 className="reveal font-display mt-6 max-w-[16ch] text-heading-lg">
                {project.title}
              </h1>

              <p className="reveal text-fg mt-8 max-w-[46ch] text-lead">
                {project.summary}
              </p>

              <div className="reveal mt-8 flex flex-wrap items-center gap-4">
                <Tag>{project.type}</Tag>
                <span className="text-faint font-mono text-caption uppercase">
                  {project.role}
                </span>
                {project.url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-fg decoration-line hover:decoration-current inline-flex items-center gap-2 text-body-sm font-medium underline underline-offset-4 transition-colors"
                  >
                    Visit the site
                    <span aria-hidden>↗</span>
                  </a>
                )}
              </div>
            </div>

            <div className="reveal lg:col-span-7">
              <WorkStill slug={project.slug} image={project.image} />
            </div>
          </div>
        </Reveal>
      </section>

      <ScrollPanel tone="dark" terminal cursor={false}>
        {/* The figures, together, once. On the teaser the metric is a caption
            beside the still; here it sits with the rest of what was measured,
            each one still naming what it is. */}
        <section className="py-section">
          <Reveal className="shell">
            <dl className="border-line grid gap-10 border-t pt-10 sm:grid-cols-3">
              {facts.map((f) => (
                <div key={f.label}>
                  <dt className="text-faint font-mono text-caption uppercase">
                    {f.label}
                  </dt>
                  <dd className="font-display mt-4 text-heading leading-none">
                    {f.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </section>

        <section className="pb-section">
          <Reveal className="shell">
            <div className="grid gap-10 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <SectionLabel>The problem</SectionLabel>
              </div>
              <p className="text-muted max-w-[52ch] text-lead lg:col-span-8">
                {project.task}
              </p>
            </div>
          </Reveal>
        </section>

        <section className="pb-section">
          <Reveal className="shell">
            <div className="grid gap-10 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <SectionLabel>What we did</SectionLabel>
              </div>

              {/* Full sentences separated by rules and spacing, not cards.
                  These are not links, and the site does not put a hover state
                  on something that cannot be clicked — the same call the
                  service pages made about their deliverables. */}
              <div className="lg:col-span-8">
                {project.approach.map((step) => (
                  <div
                    key={step.label}
                    className="border-line border-t py-8 first:border-t-0 first:pt-0 last:pb-0"
                  >
                    <h2 className="font-display text-heading-sm">
                      {step.label}
                    </h2>
                    <p className="text-muted mt-4 max-w-[52ch] text-body">
                      {step.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        <section className="pb-section">
          <Reveal className="shell">
            <div className="grid gap-10 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <SectionLabel>What changed</SectionLabel>
              </div>
              <div className="lg:col-span-8">
                <p className="text-fg max-w-[46ch] text-lead">
                  {project.outcome}
                </p>
                <ul className="mt-10 flex flex-wrap gap-3">
                  {project.stack.map((tool) => (
                    <li
                      key={tool}
                      className="border-line-strong text-muted rounded-pill border px-4 py-2 font-mono text-caption uppercase"
                    >
                      {tool}
                    </li>
                  ))}
                </ul>
                <div className="mt-12">
                  <ButtonPrimary href={work.close.cta.href}>
                    {work.close.cta.label}
                  </ButtonPrimary>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* Prev/next, wrapping — the same pager the service pages use, and the
            internal linking that makes the separate project pages read as one
            set to a crawler. */}
        <nav aria-label="More work" className="border-line border-t">
          <div className="grid sm:grid-cols-2">
            <Link
              href={`/work/${prev.slug}`}
              className="pager-tile group border-line flex flex-col gap-3 border-b p-8 transition-colors duration-300 sm:border-r sm:border-b-0 sm:p-12"
            >
              <span className="pager-label text-faint font-mono text-caption uppercase transition-colors duration-300">
                ← Previous project
              </span>
              <span className="pager-title font-display text-fg text-heading transition-colors duration-300">
                {prev.title}
              </span>
            </Link>
            <Link
              href={`/work/${next.slug}`}
              className="pager-tile group flex flex-col items-start gap-3 p-8 text-left transition-colors duration-300 sm:items-end sm:p-12 sm:text-right"
            >
              <span className="pager-label text-faint font-mono text-caption uppercase transition-colors duration-300">
                Next project →
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
