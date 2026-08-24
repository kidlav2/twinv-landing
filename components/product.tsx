import Image from "next/image";
import { product } from "@/lib/content";
import { Reveal } from "./reveal";
import { ProductCopy } from "./product-copy";

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
            {/* The heading keeps `.reveal` — it should be readable the
                moment the section arrives. The copy and CTA below moved into
                ProductCopy, which lights them word by word on scroll; they
                must not also be in the reveal batch. */}
            <ProductCopy />
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
            {/* Below lg the grid is single-column and this cell is exactly
                `.shell`'s content width — measured at 375px: a 327px image
                boxed in by the shell's 24px gutters on both sides. Negative
                margins equal to `--shell-padding` (not a hard-coded px value:
                the token is a clamp, so a fixed number would under-cancel it
                at tablet widths) pull the image out to the viewport edges for
                the whole stacked range, not only phones — that is the same
                range where the desktop bleed treatment below is inactive. */}
            <div className="mx-[calc(var(--shell-padding)*-1)] w-[calc(100%+var(--shell-padding)*2)] lg:mx-0 lg:absolute lg:inset-y-0 lg:left-0 lg:flex lg:w-[180%] lg:items-center">
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
