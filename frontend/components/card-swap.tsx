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
        // Hover/focus hold the AUTO cycle, not an in-flight swap. Pausing
        // the timeline on pointerenter meant a click (which focuses the
        // button while the pointer is already inside) started a swap and
        // immediately froze it — one change, then the stack was stuck.
        let hold = false;

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
          const front = order[0];
          const elFront = cards[front];
          // Rotate first so a killed timeline cannot leave `order` behind
          // the visuals. Relative `y: "+=520"` did that: each interrupted
          // click stacked another 520px and the front card left the frame.
          order = [...order.slice(1), front];

          tl?.kill();
          tl = gsap.timeline();

          const last = slot(total - 1, total);
          tl.to(elFront, { y: 520, duration: DUR, ease: EASE }, 0);

          order.slice(0, -1).forEach((idx, i) => {
            const s = slot(i, total);
            tl!.set(cards[idx], { zIndex: s.zIndex }, 0);
            tl!.to(
              cards[idx],
              { x: s.x, y: s.y, z: s.z, duration: DUR, ease: EASE, overwrite: "auto" },
              i * 0.15,
            );
          });

          tl.set(elFront, { zIndex: last.zIndex }, DUR * RETURN_DELAY);
          tl.to(
            elFront,
            {
              x: last.x,
              y: last.y,
              z: last.z,
              duration: DUR,
              ease: EASE,
              overwrite: "auto",
            },
            DUR * RETURN_DELAY,
          );
        };

        const start = () => {
          clearInterval(timer);
          if (hold) return;
          timer = window.setInterval(swap, DELAY);
        };

        // A click advances AND restarts the clock, so the next automatic turn
        // is a full interval away rather than whatever was left of the old one.
        advance.current = () => {
          swap();
          start();
        };

        start();

        // Hover-to-pause only where hovering is real. On a touch screen
        // `pointerenter` fires on tap and the cycle would stay paused until
        // the next tap somewhere else — a stack frozen by a stray finger.
        const hover = gsap.matchMedia();
        hover.add(HOVER_OK, () => {
          const pause = () => {
            hold = true;
            clearInterval(timer);
          };
          const resume = () => {
            hold = false;
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
 * Dark chrome, light frame. The card sits in the about page's dark zone, so
 * it must NOT carry `.tone-light` — that would paint black type onto a black
 * bar. Roles inherit the zone: paper text, pale muted.
 *
 * Border is paper, not voltage: a yellow outline reads as a CTA, and voltage
 * is a micro-accent, not a card edge. Icons are Lucide outlines at one
 * stroke, `currentColor`.
 */
export function SwapCard({
  name,
  role,
  mark,
  photo,
  photoPosition,
  className = "",
}: {
  name: string;
  role: string;
  mark: "design" | "code";
  photo?: string;
  photoPosition?: string;
  className?: string;
}) {
  return (
    <figure
      data-swap-card
      className={`card-swap-card bg-carbon border-paper rounded-card absolute top-1/2 left-1/2 flex flex-col overflow-hidden border-2 [backface-visibility:hidden] [transform-style:preserve-3d] ${className}`}
    >
      <figcaption className="border-paper flex min-h-0 items-center gap-2.5 border-b-2 px-3 py-2 sm:px-4 sm:py-2.5">
        <RoleMark kind={mark} />
        <p className="font-mono text-caption min-w-0 flex-1 truncate uppercase">
          <span className="text-fg">{name}</span>
          <span className="text-muted"> — {role}</span>
        </p>
      </figcaption>
      <div className="bg-graphite relative min-h-0 flex-1">
        {photo ? (
          <img
            src={photo}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            style={
              photoPosition ? { objectPosition: photoPosition } : undefined
            }
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : null}
      </div>
    </figure>
  );
}

/** Lucide outlined set — same 2px stroke, round caps, 24 viewBox. */
function RoleMark({ kind }: { kind: "design" | "code" }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "text-fg size-4 shrink-0",
    "aria-hidden": true,
  };

  if (kind === "design") {
    return (
      <svg {...common}>
        <path d="M12 20h9" />
        <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="m16 18 6-6-6-6" />
      <path d="m8 6-6 6 6 6" />
    </svg>
  );
}
