"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { isDocumentVisible, HOVER_OK, MOTION_OK } from "@/lib/motion";

gsap.registerPlugin(useGSAP);

/**
 * A stack of cards that cycles: the front one drops away, the rest promote
 * forward, and the dropped one returns to the back.
 *
 * Adapted from React Bits' <CardSwap /> (already GSAP-only, so no second
 * animation library came with it). Two things changed from the original:
 *
 *  - Cards are found by querying `[data-swap-card]` rather than through an
 *    array of React refs. That is how every other animated component here
 *    reaches its targets (see services-grid.tsx), and it drops the original's
 *    `useMemo(..., [childArr.length])`, which lies to the dependency linter.
 *  - The original starts its `setInterval` unconditionally in a bare
 *    `useEffect`. Here the whole scripted path lives behind `MOTION_OK` and
 *    the background-tab guard, like the rest of the site's motion.
 *
 * Not interactive: the cards are photographs, they lead nowhere, and giving
 * them a click target or a focus stop would promise an interaction that does
 * not exist. Hover pauses the cycle — that is a control (WCAG 2.2.2, moving
 * content that starts on its own must be pausable), not a decorative hover.
 */

const SKEW = 6;
const DIST_X = 56;
const DIST_Y = 64;
const DELAY = 4200;

const EASE = "elastic.out(0.6,0.9)";
const DUR = 1.6;
const PROMOTE_OVERLAP = 0.9;
const RETURN_DELAY = 0.05;

/** Where card `i` sits when it is `i` places back from the front. */
function slot(i: number, total: number) {
  return {
    x: i * DIST_X,
    y: -i * DIST_Y,
    z: -i * DIST_X * 1.5,
    zIndex: total - i,
  };
}

export function CardSwap({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;

      const cards = gsap.utils.toArray<HTMLElement>("[data-swap-card]", root);
      if (cards.length < 2) return;

      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        // First line, as everywhere else that hides or displaces something.
        // GSAP advances on requestAnimationFrame, which a background tab
        // never fires: placing the cards into their slots here and then
        // freezing would leave three cards stacked in one spot with no way
        // out. Bail, and the CSS fallback below stands instead.
        if (!isDocumentVisible()) return;

        const total = cards.length;
        let order = cards.map((_, i) => i);
        let tl: gsap.core.Timeline | null = null;
        let timer = 0;

        cards.forEach((card, i) => {
          const s = slot(i, total);
          gsap.set(card, {
            ...s,
            xPercent: -50,
            yPercent: -50,
            skewY: SKEW,
            transformOrigin: "center center",
            force3D: true,
          });
        });

        // Written only now that the scripted path is actually live. It is the
        // switch the CSS fallback keys off, and it MUST be removed by hand in
        // cleanup — mm.revert() reverts tweens, not attribute writes. Same
        // contract as `[data-fill]` on buttons and `[data-slider]` on the
        // services grid.
        root.dataset.swap = "";

        const swap = () => {
          const [front, ...rest] = order;
          const elFront = cards[front];
          tl = gsap.timeline();

          tl.to(elFront, { y: "+=420", duration: DUR, ease: EASE });

          tl.addLabel("promote", `-=${DUR * PROMOTE_OVERLAP}`);
          rest.forEach((idx, i) => {
            const s = slot(i, total);
            tl!.set(cards[idx], { zIndex: s.zIndex }, "promote");
            tl!.to(
              cards[idx],
              { x: s.x, y: s.y, z: s.z, duration: DUR, ease: EASE },
              `promote+=${i * 0.15}`,
            );
          });

          const back = slot(total - 1, total);
          tl.addLabel("return", `promote+=${DUR * RETURN_DELAY}`);
          tl.call(
            () => void gsap.set(elFront, { zIndex: back.zIndex }),
            undefined,
            "return",
          );
          tl.to(
            elFront,
            { x: back.x, y: back.y, z: back.z, duration: DUR, ease: EASE },
            "return",
          );
          tl.call(() => {
            order = [...rest, front];
          });
        };

        const start = () => {
          clearInterval(timer);
          timer = window.setInterval(swap, DELAY);
        };

        swap();
        start();

        // Hover-to-pause only where hovering is real. On a touch screen
        // `pointerenter` fires on tap and the cycle would stay paused until
        // the next tap somewhere else — a stack frozen by a stray finger.
        const hover = gsap.matchMedia();
        hover.add(HOVER_OK, () => {
          const pause = () => {
            tl?.pause();
            clearInterval(timer);
          };
          const resume = () => {
            tl?.play();
            start();
          };
          root.addEventListener("pointerenter", pause);
          root.addEventListener("pointerleave", resume);
          return () => {
            root.removeEventListener("pointerenter", pause);
            root.removeEventListener("pointerleave", resume);
          };
        });

        return () => {
          clearInterval(timer);
          hover.revert();
          delete root.dataset.swap;
        };
      });

      return () => mm.revert();
    },
    { scope },
  );

  return (
    <div
      ref={scope}
      /* The stack is dealt down-right from a single anchor point, so its
         visual centre sits half the total drift away from that anchor
         (DIST_X * (n-1) / 2 across, DIST_Y * (n-1) / 2 up). Without this
         correction the whole group hangs to the right — measured at 375px,
         the back card's edge landed exactly on the viewport edge. The
         constants are the drift, not a nudge, and they hold at every card
         size because the slot offsets are fixed.
         Safe as a container transform: GSAP only ever writes to the cards. */
      className={`card-swap relative translate-x-[-56px] translate-y-[64px] [perspective:900px] ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * `.tone-light` is load-bearing, not decoration: this white card renders
 * inside the page's dark zone, and without resetting the roles its caption
 * would inherit that zone's pale `muted` colour onto a white surface. This is
 * the exact trap AGENTS.md documents for light surfaces inside dark zones.
 */
export function SwapCard({
  caption,
  className = "",
}: {
  caption: string;
  className?: string;
}) {
  return (
    <figure
      data-swap-card
      className={`card-swap-card tone-light bg-paper rounded-card absolute top-1/2 left-1/2 flex flex-col overflow-hidden [backface-visibility:hidden] [transform-style:preserve-3d] ${className}`}
    >
      {/* The placeholder itself. A flat mist panel, no icon, no dashed
          "upload" affordance — this is a slot waiting for a photograph, not
          a control. The caption says which photograph. */}
      <div className="bg-mist flex-1" />
      {/* `text-muted`, not the `text-faint` the site's decorative mono labels
          use: on this white surface faint (#979797) lands at 2.8:1, and this
          caption is the only thing saying which photograph belongs here. */}
      <figcaption className="text-muted font-mono border-line border-t px-5 py-4 text-caption uppercase">
        {caption}
      </figcaption>
    </figure>
  );
}
