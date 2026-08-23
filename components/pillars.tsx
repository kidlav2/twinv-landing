import { pillars } from "@/lib/content";
import { Reveal } from "./reveal";
import { PillarCard } from "./pillar-card";
import type { PillarVariant } from "./pillar-visual";

const VARIANTS: PillarVariant[] = ["design", "build", "grow"];

/**
 * Last section in the black zone — no card chrome (no fill, border, or shadow)
 * by design. Stays a server component; only the animated card is client.
 */
export function Pillars() {
  return (
    <section className="py-32">
      <Reveal className="shell">
        <h2 className="reveal font-display text-heading-lg max-w-[14ch]">
          {pillars.headline}
        </h2>

        <div className="mt-20 grid gap-16 md:grid-cols-3 md:gap-12">
          {pillars.items.map((item, i) => (
            <PillarCard
              key={item.title}
              title={item.title}
              body={item.body}
              href={item.href}
              variant={VARIANTS[i % VARIANTS.length]}
            />
          ))}
        </div>
      </Reveal>
    </section>
  );
}
