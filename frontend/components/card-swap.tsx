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
 * animation library came with it), with three changes:
 *
 *  - Cards are found by querying `[data-swap-card]` rather than through an
 *    array of React refs. That is how every other animated component here
 *    reaches its targets (see services-grid.tsx), and it drops the original's
 *    `useMemo(..., [childArr.length])`, which lies to the dependency linter.
 *  - The original starts its `setInterval` unconditionally in a bare
 *    `useEffect`. Here the whole scripted path lives behind `MOTION_OK` and
 *    the background-tab guard, like the rest of the site's motion.
 *  - The root is a real `<button>`. Clicking advances the stack, so this is a
 *    control and has to be one: that buys the keyboard path and a focus ring
 *    for free, instead of a div with a click handler nobody can reach by Tab.
 *
 * Hover pauses the cycle. That is not a decorative hover — content that moves
 * on its own for more than five seconds has to be pausable (WCAG 2.2.2).
 */

const SKEW = 6;
const DIST_X = 64;
const DIST_Y = 76;
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
  const scope = useRef<HTMLButtonElement>(null);
  /** Set by the scripted path; the click handler calls it. */
  const advance = useRef<(() => void) | null>(null);

  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;

      const cards = gsap.utils.toArray<HTMLElement>("[data-swap-card]", root);
      if (cards.length < 2) return;

      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        // First line, as everywhere else that displaces something. GSAP
        // advances on requestAnimationFrame, which a background tab never
        // fires: dealing the cards into their slots here and then freezing
        // would leave the whole stack in one spot with no way out. Bail, and
        // the CSS fallback in globals.css stands instead.
        if (!isDocumentVisible()) return;

        const total = cards.length;
        let order = cards.map((_, i) => i);
        let tl: gsap.core.Timeline | null = null;
        let timer = 0;

        cards.forEach((card, i) => {
          gsap.set(card, {
            ...slot(i, total),
            xPercent: -50,
            yPercent: -50,
            skewY: SKEW,
            transformOrigin: "center center",
            force3D: true,
          });
        });

        // Written only now that the scripted path is live. It is the switch
        // the CSS fallback keys off, and it MUST be removed by hand in
        // cleanup — mm.revert() reverts tweens, not attribute writes. Same
        // contract as `[data-fill]` on buttons and `[data-slider]` on the
        // services grid.
        root.dataset.swap = "";

        const swap = () => {
          const [front, ...rest] = order;
          const elFront = cards[front];
          // Overwrite rather than queue: a click landing mid-flight should
          // take over the motion, not wait its turn behind it.
          tl?.kill();
          tl = gsap.timeline();

          tl.to(elFront, { y: "+=520", duration: DUR, ease: EASE });

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

        // A click advances AND restarts the clock, so the next automatic turn
        // is a full interval away rather than whatever was left of the old one.
        advance.current = () => {
          swap();
          start();
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
          // Keyboard focus deserves the same hold as a hovering cursor.
          root.addEventListener("focus", pause);
          root.addEventListener("blur", resume);
          return () => {
            root.removeEventListener("pointerenter", pause);
            root.removeEventListener("pointerleave", resume);
            root.removeEventListener("focus", pause);
            root.removeEventListener("blur", resume);
          };
        });

        return () => {
          clearInterval(timer);
          hover.revert();
          advance.current = null;
          delete root.dataset.swap;
        };
      });

      return () => mm.revert();
    },
    { scope },
  );

  return (
    <button
      ref={scope}
      type="button"
      aria-label="Show the next photo"
      onClick={() => advance.current?.()}
      /* The stack is dealt down-right from one anchor, so its visual centre
         sits half the total drift away from it. Correcting by that amount is
         what keeps the group optically centred on its box rather than hanging
         below and to the right of it. Safe as a container transform: GSAP
         only ever writes to the cards inside. */
      /* `w-full` is not cosmetic. A <button> shrink-wraps its content even at
         `display: block`, and every card inside is absolutely positioned — so
         the box measured zero wide, and the percentage translate that pushes
         the stack off-screen resolved against zero and did nothing. */
      className={`card-swap relative block w-full translate-y-[76px] cursor-pointer appearance-none [perspective:1200px] ${className}`}
    >
      {children}
    </button>
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
      {/* Caption on top, reading as the card's tab — with the stack dealt
          up-and-right, the top edge is the part of every card that stays
          visible behind the one in front, so that is where a label can
          actually be read. At the bottom it was hidden under the next card.

          `text-muted`, not the `text-faint` the site's decorative mono labels
          use: on this white surface faint (#979797) lands at 2.8:1, and this
          caption is the only thing saying which photograph belongs here. */}
      <figcaption className="text-muted font-mono border-line border-b px-6 py-5 text-caption uppercase">
        {caption}
      </figcaption>
      {/* The placeholder itself. A flat mist panel — no icon, no dashed
          "upload" affordance — because this is a slot waiting for a
          photograph, not a control. */}
      <div className="bg-mist flex-1" />
    </figure>
  );
}
