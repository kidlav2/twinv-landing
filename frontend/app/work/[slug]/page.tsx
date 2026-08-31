import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { work } from "@/lib/content";
import {
  allWorkSlugs,
  familyOf,
  findCase,
  findFamily,
  layerIdFor,
} from "@/lib/work";
import { PageShell } from "@/components/page-shell";
import { Reveal } from "@/components/reveal";
import { ScrollPanel } from "@/components/scroll-panel";
import { ButtonGhost, Tag, TextLink } from "@/components/ui";
import { WorkLive, hostOf } from "@/components/work-live";
import { CaseBeat, CaseTimeline } from "@/components/case-timeline";
import { CaseGallery } from "@/components/case-gallery";
import { AdjacentPager } from "@/components/adjacent-pager";
import { WorkHub } from "@/components/work-hub";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return allWorkSlugs();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const slug = (await params).slug;
  const family = findFamily(slug);
  if (family) return { title: family.title, description: family.summary };
  const project = findCase(slug);
  if (!project) return {};
  return { title: project.title, description: project.summary };
}

/** Same pointer the service pages use — the `←` glyph is too thin and sits
 *  too low beside display type. */
/** First two words of the problem beat, in voltage. On carbon this is
 *  readable as type; a yellow band would be a surface, which voltage is
 *  not allowed to be. */
function VoltageLead({ text }: { text: string }) {
  const match = /^(\S+\s+\S+)([\s\S]*)$/.exec(text);
  if (!match) return text;
  return (
    <>
      <span className="text-voltage">{match[1]}</span>
      {match[2]}
    </>
  );
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
 * One case, in four beats: what was wrong, what we did, what changed, and
 * the stack. A gallery of frames follows the timeline, then the pager.
 * The live site is the screenshot in the masthead.
 *
 * What this page deliberately does NOT contain is a description of how the
 * studio works. A methodology block (discovery → design → build → launch) is
 * the same on every project by definition, which makes it an ad for process
 * rather than evidence about this piece of work — and the visitor reading a
 * case study is a buyer, not a candidate. The sequence here is specific: this
 * problem, these three decisions, this result.
 *
 * Section titles are display size and pin while their body scrolls — the
 * Aceternity timeline idea, on GSAP, because CSS sticky cannot survive
 * ScrollSmoother's transform. The CTA lives in the footer, not here.
 */
export default async function ProjectPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const slug = (await params).slug;
  const family = findFamily(slug);
  if (family) {
    return (
      <PageShell flushFooter footerTone="dark">
        <WorkHub family={family} />
      </PageShell>
    );
  }

  const project = findCase(slug);
  if (!project) notFound();

  const engagement = familyOf(project);
  if (engagement) {
    const layer = layerIdFor(project, engagement);
    redirect(
      layer && layer !== "website"
        ? `/work/${engagement.slug}#${layer}`
        : `/work/${engagement.slug}`,
    );
  }

  const total = work.items.length;
  const index = work.items.findIndex((p) => p.slug === project.slug);
  const prev = work.items[(index - 1 + total) % total];
  const next = work.items[(index + 1) % total];

  const lead = project.kind === "self" ? "Self-initiated" : project.sector;
  const host = hostOf(project.url);

  return (
    <PageShell flushFooter footerTone="dark">
      {/* Short of the viewport on purpose: a sliver of the black panel below
          the fold is what asks for the scroll. Same as the service pages. */}
      <section className="min-h-[88svh] overflow-x-clip pt-[calc(var(--spacing-nav)+24px)] pb-section">
        <Reveal className="shell">
          <Link
            href="/work"
            className="reveal font-display text-faint hover:text-fg inline-flex items-center gap-3 text-heading-sm transition-colors"
          >
            <BackChevron />
            {work.more}
          </Link>

          <div className="mt-12 grid items-center gap-10 lg:mt-16 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-7">
              <WorkLive item={project} />
              {/* Phone: the visit control sits under the still, not under a
                  title that has already scrolled away. Desktop keeps the
                  text-column link — two destinations, not a nested <a>. */}
              <div className="reveal mt-6 lg:hidden">
                <ButtonGhost
                  href={project.url}
                  external
                  className="w-full"
                >
                  {`${work.visit} · ${host}`}
                </ButtonGhost>
              </div>
            </div>

            <div className="lg:col-span-5">
              <p className="reveal text-faint font-mono text-caption uppercase">
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

              <div className="reveal mt-8 flex flex-wrap items-center gap-x-4 gap-y-3">
                <Tag>{project.type}</Tag>
                <span className="text-faint font-mono text-caption uppercase">
                  {project.role}
                </span>
              </div>

              <div className="reveal mt-8 hidden lg:block">
                <TextLink href={project.url} external>
                  {`${work.visit} · ${host}`}
                </TextLink>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <ScrollPanel tone="dark" terminal cursor={false}>
        <section className="py-section">
          <div className="shell">
            <CaseTimeline>
              <CaseBeat title={work.beats.problem}>
                <p className="text-muted max-w-[46ch] text-body">
                  <VoltageLead text={project.task} />
                </p>
              </CaseBeat>

              <CaseBeat title={work.beats.did}>
                {project.approach.map((step) => (
                  <div
                    key={step.label}
                    className="border-line border-t py-8 first:border-t-0 first:pt-0 last:pb-0"
                  >
                    <h3 className="font-display text-heading-sm">{step.label}</h3>
                    <p className="text-muted mt-4 max-w-[46ch] text-body">
                      {step.body}
                    </p>
                  </div>
                ))}
              </CaseBeat>

              <CaseBeat title={work.beats.changed}>
                <p className="text-fg max-w-[46ch] text-body">
                  {project.outcome}
                </p>
                {project.outcomeFacts.map((fact, i) => (
                  <div
                    key={`${fact.value}-${fact.label}-${i}`}
                    className="border-line mt-10 max-w-[46ch] border-t pt-8 first-of-type:mt-12"
                  >
                    <p className="font-display text-heading-lg">{fact.value}</p>
                    <p className="text-muted mt-3 font-mono text-caption uppercase">
                      {fact.label}
                    </p>
                  </div>
                ))}
              </CaseBeat>

              <CaseBeat title={work.beats.stack}>
                <ul>
                  {project.stack.map((tool) => (
                    <li
                      key={tool}
                      className="border-line text-muted border-t py-5 font-mono text-caption uppercase first:border-t-0 first:pt-0"
                    >
                      {tool}
                    </li>
                  ))}
                </ul>
              </CaseBeat>
            </CaseTimeline>
          </div>
        </section>

        <CaseGallery
          slug={project.slug}
          heading={work.frames}
          shots={[project.image, ...project.gallery].filter(Boolean)}
        />

        <AdjacentPager
          label="More work"
          prev={{
            href: `/work/${prev.slug}`,
            kicker: work.pager.prev,
            title: prev.title,
          }}
          next={{
            href: `/work/${next.slug}`,
            kicker: work.pager.next,
            title: next.title,
          }}
        />
      </ScrollPanel>
    </PageShell>
  );
}
