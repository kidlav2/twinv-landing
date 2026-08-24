import { services } from "@/lib/content";
import { Reveal } from "./reveal";
import { ServicesGrid } from "./services-grid";

/**
 * Server component again — the section is a heading and a line of copy. Only
 * the grid below it needs a client bundle, and it owns that boundary itself.
 */
export function Services() {
  return (
    <section id="services" className="py-section">
      <Reveal className="shell">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="reveal font-display text-heading-lg">
            {services.headline}
          </h2>
          <p className="reveal text-muted max-w-[32ch] text-sub">
            {services.sub}
          </p>
        </div>

        <ServicesGrid />
      </Reveal>
    </section>
  );
}
