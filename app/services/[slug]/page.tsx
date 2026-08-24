import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { services } from "@/lib/content";
import { PageShell } from "@/components/page-shell";
import { Reveal } from "@/components/reveal";
import { ButtonPrimary } from "@/components/ui";

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

export default async function ServicePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const service = findService((await params).slug);
  if (!service) notFound();

  return (
    <PageShell>
      <section className="pt-[calc(var(--spacing-nav)+24px)] pb-section">
        <Reveal className="shell">
          <div className="max-w-[46ch]">
            <Link
              href="/#services"
              className="text-faint hover:text-fg font-mono text-caption uppercase transition-colors"
            >
              ← {services.headline}
            </Link>
            <p className="text-faint mt-6 font-mono text-caption uppercase">
              {service.meta}
            </p>
            <h1 className="font-display mt-4 text-display">{service.title}</h1>
            <p className="text-fg mt-8 text-lead">{service.intro}</p>
          </div>

          {/* Same list-under-a-mono-label idiom as Stack and /about — the
              content here is a short deliverables list, not a card grid. */}
          <div className="mt-16 max-w-[52ch]">
            <p className="text-faint font-mono text-caption uppercase">
              What&rsquo;s included
            </p>
            <ul className="border-line mt-6 flex flex-col divide-y divide-line border-t">
              {service.included.map((item) => (
                <li key={item} className="text-muted py-4 text-body">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-14">
            <ButtonPrimary href="/#contact">Start a project</ButtonPrimary>
          </div>
        </Reveal>
      </section>
    </PageShell>
  );
}
