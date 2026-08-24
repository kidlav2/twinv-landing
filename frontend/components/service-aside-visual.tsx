"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { HOVER_OK, isDocumentVisible, MOTION_OK } from "@/lib/motion";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * A small dot field that answers the pointer — the aside beside the "why this
 * exists" paragraph, which was otherwise five empty columns of black.
 *
 * Deliberately minor. The hero already carries a full blob composition, so
 * this is a quiet grid, not a second set piece: dots breathe on a slow
 * staggered loop, and swell toward the pointer as it crosses them.
 *
 * The two effects animate DIFFERENT properties on purpose — the idle loop owns
 * `opacity`, the pointer owns `scale`. Pointing both at the same property
 * would have them overwrite each other, and a dot would stick wherever the
 * losing tween abandoned it.
 *
 * The resting markup IS the finished state: full opacity, unscaled. With no
 * JS, reduced motion, or a background tab, this renders as a plain grid that
 * looks intentional rather than broken.
 */

const COLS = 5;
const ROWS = 5;
const STEP = 44;
const PAD = 22;
const SIZE = PAD * 2 + STEP * (COLS - 1);

/** Mint at the centre, voltage off-axis. Two of twenty-five dots, each 5px in
 *  a 220px field — micro-accents, which is the only role either colour has. */
const MINT_AT = 12;
const VOLT_AT = 8;

const DOTS = Array.from({ length: COLS * ROWS }, (_, i) => ({
  i,
  x: PAD + (i % COLS) * STEP,
  y: PAD + Math.floor(i / COLS) * STEP,
  fill: i === MINT_AT ? "#d1ffca" : i === VOLT_AT ? "#fff100" : "currentColor",
}));

export function ServiceAsideVisual() {
  const scope = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const svg = scope.current;
      if (!svg) return;
      const dots = gsap.utils.toArray<SVGCircleElement>(
        svg.querySelectorAll("circle"),
      );
      if (!dots.length) return;

      const mm = gsap.matchMedia();

      // Idle breathing. Guarded because it tweens FROM the rendered state to a
      // dimmer one — in a background tab rAF never advances, and a frozen
      // half-faded grid is not what the markup promises.
      mm.add(MOTION_OK, () => {
        if (!isDocumentVisible()) return;

        const loop = gsap.to(dots, {
          opacity: 0.3,
          duration: 1.7,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          stagger: { each: 0.06, from: "random" },
          paused: true,
        });

        // Don't burn rAF on twenty-five tweens nobody can see.
        const st = ScrollTrigger.create({
          trigger: svg,
          start: "top bottom",
          end: "bottom top",
          onToggle: ({ isActive }) => (isActive ? loop.play() : loop.pause()),
        });

        return () => {
          st.kill();
          loop.kill();
        };
      });

      // Pointer proximity. HOVER_OK, not MOTION_OK: on a touch screen
      // `pointermove` fires once on tap and the swell would stick.
      mm.add(HOVER_OK, () => {
        const scaleTo = dots.map((d) =>
          gsap.quickTo(d, "scale", { duration: 0.45, ease: "power3.out" }),
        );
        // Displacement rides on x/y while the swell owns `scale` and the idle
        // loop owns `opacity` — three effects, three properties, so none of
        // them can strand a dot where another one abandoned it.
        const xTo = dots.map((d) =>
          gsap.quickTo(d, "x", { duration: 0.6, ease: "power3.out" }),
        );
        const yTo = dots.map((d) =>
          gsap.quickTo(d, "y", { duration: 0.6, ease: "power3.out" }),
        );

        const onMove = (e: PointerEvent) => {
          const box = svg.getBoundingClientRect();
          // Pointer into viewBox units — the SVG is fluid, so its rendered
          // size and its coordinate system are never the same number.
          const px = ((e.clientX - box.left) / box.width) * SIZE;
          const py = ((e.clientY - box.top) / box.height) * SIZE;

          DOTS.forEach((dot, i) => {
            const dx = dot.x - px;
            const dy = dot.y - py;
            const d = Math.hypot(dx, dy);
            // Falls off over roughly two grid steps, so a few neighbours move
            // together and it reads as a field rather than one dot lighting up.
            const k = Math.max(0, 1 - d / (STEP * 2));
            scaleTo[i](1 + k * 1.4);

            // Pushed away along the line from the cursor, but never further
            // than most of one grid step: the field should flinch, not come
            // apart. `d || 1` keeps a dot sitting exactly under the pointer
            // from dividing by zero and flying off.
            const push = (k * k * STEP * 0.7) / (d || 1);
            xTo[i](dx * push);
            yTo[i](dy * push);
          });
        };

        const onLeave = () => {
          scaleTo.forEach((s) => s(1));
          xTo.forEach((s) => s(0));
          yTo.forEach((s) => s(0));
        };

        svg.addEventListener("pointermove", onMove);
        svg.addEventListener("pointerleave", onLeave);

        return () => {
          svg.removeEventListener("pointermove", onMove);
          svg.removeEventListener("pointerleave", onLeave);
        };
      });

      return () => mm.revert();
    },
    { scope },
  );

  return (
    <svg
      ref={scope}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="text-faint h-auto w-full max-w-[240px]"
      aria-hidden
    >
      {DOTS.map((d) => (
        <circle key={d.i} cx={d.x} cy={d.y} r="5" fill={d.fill} />
      ))}
    </svg>
  );
}
