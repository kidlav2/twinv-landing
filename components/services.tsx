import { services } from "@/lib/content";
import { Reveal } from "./reveal";

export function Services() {
  return (
    <section id="services" className="py-section">
      <Reveal className="shell">
        <div className="reveal flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="font-display text-heading-lg">{services.headline}</h2>
          <p className="text-muted max-w-[32ch] text-sub">{services.sub}</p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.items.map((s) => (
            <a
              key={s.title}
              href="#contact"
              className="group bg-paper rounded-card hover:bg-carbon flex flex-col p-8 transition-colors duration-300"
            >
              <span className="text-faint group-hover:text-ash font-mono text-caption uppercase transition-colors">
                {s.meta}
              </span>
              <h3 className="font-display text-carbon group-hover:text-paper mt-4 text-heading transition-colors">
                {s.title}
              </h3>
              <p className="text-muted group-hover:text-ash mt-4 flex-1 text-body transition-colors">
                {s.body}
              </p>
              <span className="text-carbon group-hover:text-paper mt-8 flex items-center gap-2 font-mono text-caption uppercase transition-colors">
                Learn more
                <span
                  aria-hidden
                  className="transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
              </span>
            </a>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
