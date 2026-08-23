"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { services } from "@/lib/content";
import { HOVER_OK, MOTION_OK } from "@/lib/motion";

gsap.registerPlugin(useGSAP);

/**
 * The six services as a 3x2 grid with one black block that slides to whichever
 * card is hovered or focused, instead of a carousel. Two carousels on one page
 * (Cases is the other) made the whole list feel like something to page through
 * rather than scan.
 *
 * The cards are transparent with a hairline; only the moving block is a filled
 * surface. That is the same motif as the Stack chips
 * (`border-line hover:bg-fg`), one size up — and it keeps mint and voltage off
 * a large surface, which the system forbids.
 *
 * No `isDocumentVisible()` guard here, deliberately: this reveals nothing and
 * hides nothing. The block starts invisible and only ever appears in response
 * to a pointer or focus, neither of which can happen in a background tab. The
 * guard exists for entrance animations that pre-hide content.
 */
export function ServicesGrid() {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const grid = scope.current;
      const block = grid?.querySelector<HTMLElement>("[data-slider-block]");
      if (!grid || !block) return;

      const mm = gsap.matchMedia();

      mm.add({ motion: MOTION_OK, hover: HOVER_OK }, (ctx) => {
        const { motion, hover } = ctx.conditions as {
          motion: boolean;
          hover: boolean;
        };
        // Reduced motion: no block at all. `data-slider` stays off the grid, so
        // the CSS `:hover` branch in globals.css is what responds.
        if (!motion) return;

        let active: HTMLElement | null = null;
        let shown = false;

        /**
         * offsetLeft/offsetTop, never getBoundingClientRect(). Three reasons,
         * all live on this page: `Reveal` tweens the cards from `y: 24`, so a
         * rect can report a position the card is still moving away from;
         * `#smooth-content` is transformed by ScrollSmoother, so rects shift
         * with scroll; and offsets are measured from `offsetParent`, which is
         * this grid — exactly the coordinate space the block is positioned in.
         */
        const geometry = (card: HTMLElement) => ({
          x: card.offsetLeft,
          y: card.offsetTop,
          width: card.offsetWidth,
          height: card.offsetHeight,
        });

        const activate = (card: HTMLElement) => {
          if (card === active) return;
          active?.classList.remove("tone-dark");
          card.classList.add("tone-dark");
          active = card;

          if (!shown) {
            // First appearance is a fade in place. Tweening geometry from the
            // block's unset 0x0 corner would fly it in from the top-left.
            gsap.set(block, geometry(card));
            gsap.to(block, { opacity: 1, duration: 0.25, ease: "power2.out" });
            shown = true;
            return;
          }
          // Geometry, not scale: an uneven scale would squash `rounded-card`
          // into an ellipse (same reason scroll-panel.tsx animates width).
          gsap.to(block, {
            ...geometry(card),
            duration: 0.4,
            ease: "power3.out",
            overwrite: "auto",
          });
        };

        const deactivate = () => {
          active?.classList.remove("tone-dark");
          active = null;
          shown = false;
          // Fade only. Moving the block on the way out would drag a black
          // rectangle across the grid every time the pointer leaves.
          gsap.to(block, { opacity: 0, duration: 0.2, ease: "power2.out" });
        };

        const cardFrom = (target: EventTarget | null) =>
          target instanceof Element
            ? target.closest<HTMLElement>("[data-service-card]")
            : null;

        const onFocusIn = (e: FocusEvent) => {
          const card = cardFrom(e.target);
          if (card) activate(card);
        };
        const onFocusOut = (e: FocusEvent) => {
          if (!grid.contains(e.relatedTarget as Node | null)) deactivate();
        };
        const onPointerOver = (e: PointerEvent) => {
          const card = cardFrom(e.target);
          if (card) activate(card);
        };
        const onResize = () => {
          // Re-measure without tweening: a reflow is not a movement to watch.
          if (active && shown) gsap.set(block, geometry(active));
        };

        // Focus rides on MOTION_OK rather than HOVER_OK on purpose — a
        // keyboard user on a touchscreen laptop still needs to see where they
        // are, and that machine reports no hover.
        grid.addEventListener("focusin", onFocusIn);
        grid.addEventListener("focusout", onFocusOut);
        window.addEventListener("resize", onResize);

        if (hover) {
          grid.addEventListener("pointerover", onPointerOver);
          grid.addEventListener("pointerleave", deactivate);
          // Switches globals.css off its CSS-only hover branch. Written from
          // JS so the CSS fallback is what runs when this code does not.
          grid.setAttribute("data-slider", "");
        }

        return () => {
          grid.removeEventListener("focusin", onFocusIn);
          grid.removeEventListener("focusout", onFocusOut);
          grid.removeEventListener("pointerover", onPointerOver);
          grid.removeEventListener("pointerleave", deactivate);
          window.removeEventListener("resize", onResize);
          // mm.revert() reverts tweens, not attribute or class writes.
          grid.removeAttribute("data-slider");
          active?.classList.remove("tone-dark");
        };
      });

      return () => mm.revert();
    },
    { scope },
  );

  return (
    <div
      ref={scope}
      className="services-grid relative mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {/* Painted before the cards in DOM order, so the cards — which are
          positioned too — stack above it without needing a z-index. */}
      <div
        data-slider-block
        aria-hidden
        className="bg-carbon rounded-card pointer-events-none absolute top-0 left-0 opacity-0"
      />

      {services.items.map((s) => (
        <a
          key={s.title}
          href="#contact"
          data-service-card
          className="service-card border-line rounded-card group relative flex flex-col border p-7 transition-colors duration-300 sm:p-8"
        >
          {/* Role utilities only. When the card is marked `tone-dark` every
              one of these flips at once — no per-element `group-hover:` colour
              pairs to keep in sync, and `:focus-visible` turns white by
              itself. Same trick as the dark card in banners.tsx. */}
          <span className="text-faint font-mono text-caption uppercase">
            {s.meta}
          </span>
          <h3 className="font-display text-fg mt-4 text-heading-sm">
            {s.title}
          </h3>
          <p className="text-muted mt-3 flex-1 text-body-sm">{s.body}</p>
          <span className="text-fg mt-6 flex items-center gap-2 font-mono text-caption uppercase">
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
  );
}
