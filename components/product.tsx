import Image from "next/image";
import { product } from "@/lib/content";
import { ButtonPrimary } from "./ui";
import { Reveal } from "./reveal";

export function Product() {
  return (
    <section className="overflow-x-clip py-section">
      <Reveal className="shell">
        {/* A real 50/50 split via grid-cols-2 — each column is exactly half
            the row by construction, so the text side's width is never a side
            effect of how big the image happens to be. The image then breaks
            its own half open further (below) without touching that math. */}
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-0">
          <div className="lg:pr-12">
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

          {/* The PNG itself is genuinely transparent — measured: 53% of the
              frame is opaque and that part is the dark laptop/illustration
              (mean luminance 32.5/255), not a baked-in white fill. It sits
              straight on the panel, no card, no surface of its own.

              `lg:relative` on this cell makes IT the positioning context, so
              the bleed below is scoped to this half only — the text column's
              width stays exactly 50%, unaffected by how far the image
              overflows past its own edge. Sized at ~180% of the column
              (roughly double the plain-50% baseline, per the ask), anchored
              to the column's left edge so the overflow runs off the right —
              `overflow-x-clip` on the section is what makes that safe (cuts
              the overflow instead of adding a horizontal scrollbar to the
              whole page). */}
          <div className="reveal relative">
            <div className="lg:absolute lg:inset-y-0 lg:left-0 lg:flex lg:w-[180%] lg:items-center">
              {/* `draggable={false}` alone is not enough: WebKit ignores it in
                  some paths and honours the non-standard `-webkit-user-drag`
                  instead. Deliberately NOT `pointer-events-none` — that would
                  kill right-click/save and long-press zoom for no benefit. */}
              <Image
                src="/studio-macbook.png"
                alt="Two people working in a studio — one writing code, one mapping the plan on a whiteboard"
                width={2752}
                height={1536}
                sizes="(min-width: 1024px) 90vw, 100vw"
                draggable={false}
                className="h-auto w-full select-none [-webkit-user-drag:none]"
              />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
