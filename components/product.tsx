import Image from "next/image";
import { product } from "@/lib/content";
import { ButtonPrimary } from "./ui";
import { Reveal } from "./reveal";

export function Product() {
  return (
    <section className="overflow-x-clip py-section">
      <Reveal className="shell">
        {/* `lg:relative` makes this the positioning context for the bled
            image below. It spans the shell's full (viewport) width, so a
            descendant anchored at `right: -shell-padding` lands exactly flush
            with the browser edge — not past it, so no horizontal scrollbar.
            `lg:block` (not grid): the image is `lg:absolute`, out of flow, so
            a grid's second track would just sit empty and gap the text away
            from where the image actually bleeds from. */}
        <div className="grid items-center gap-12 lg:relative lg:block">
          <div className="lg:max-w-[46ch]">
            <h2 className="reveal font-display text-display">
              {product.headline}
            </h2>
            {product.body.map((p) => (
              <p key={p} className="reveal text-fg mt-6 text-lead">
                {p}
              </p>
            ))}
            <div className="reveal mt-10">
              <ButtonPrimary href={product.cta.href}>
                {product.cta.label}
              </ButtonPrimary>
            </div>
          </div>

          {/* The illustration needs a light surface under it. Measured: 53% of
              the PNG is opaque and that part averages luminance 32.5/255, with
              only a fifth of it above 60 — on the black panel it read as a dark
              smudge. A paper card is the design system's own answer ("white is
              a card surface"), and `tone-light` resets the text roles inside.

              On desktop the card breaks out of the grid, and its right ~30%
              is pushed past the viewport edge on purpose — `overflow-x-clip`
              on the section is what makes that safe (cuts the overflow
              instead of adding a horizontal scrollbar to the whole page). */}
          <div className="reveal tone-light bg-paper rounded-card mt-8 p-6 sm:p-10 lg:absolute lg:inset-y-0 lg:mt-0 lg:flex lg:w-[52vw] lg:items-center lg:[right:calc(-1*var(--shell-padding)-16vw)]">
            <Image
              src="/studio-macbook.png"
              alt="Two people working in a studio — one writing code, one mapping the plan on a whiteboard"
              width={2752}
              height={1536}
              sizes="(min-width: 1024px) 46vw, 100vw"
              className="h-auto w-full"
            />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
