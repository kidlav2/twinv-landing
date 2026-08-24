"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { useGSAP } from "@gsap/react";
import { MOTION_OK } from "@/lib/motion";
import { blobPath } from "@/lib/blob";

gsap.registerPlugin(useGSAP, ScrollTrigger, MorphSVGPlugin);

/**
 * The closing section's counterpart to the hero blobs — same machinery,
 * deliberately not the same picture.
 *
 * Two things make it read as its own thing rather than a reprise: the shapes
 * are built from SIX points instead of eight, which gives blunter, more
 * angular silhouettes (eight points with gentle offsets tends toward a
 * squircle), and half the composition is outlines rather than fills. The hero
 * is all solid mass; this one interlocks rings and solids.
 *
 * Palette follows the same contract as the hero and for the same reason:
 * AGENTS.md puts mint and voltage on micro-elements only, so carbon, paper and
 * ash carry every large shape and the two chromatic ones are the smallest in
 * the frame.
 *
 * No isDocumentVisible() guard here, unlike hero-blobs.tsx: there is no
 * entrance tween and nothing is pre-hidden. Every resting shape is authored in
 * the markup, so with no JS, reduced motion, or a background tab, what stands
 * is a correct static composition rather than a blank frame.
 */
const SHAPES = [
  {
    id: "cs-ring1",
    kind: "ring",
    // #979797, not the #c6c6c6 ash the hairlines use. Against the #e5e5e5
    // canvas that lighter value is the "subtle gray on gray" the system rules
    // out — the same reason the service cards moved to --color-line-strong.
    stroke: "#979797",
    width: 2,
    cx: 220,
    cy: 240,
    base: 160,
    variants: [
      [1.14, 0.84, 1.2, 0.9, 1.06, 0.96],
      [0.88, 1.18, 0.94, 1.22, 0.8, 1.1],
      [1.2, 0.92, 0.84, 1.06, 1.16, 0.86],
    ],
  },
  {
    id: "cs-mass",
    kind: "solid",
    fill: "#000000",
    cx: 200,
    cy: 250,
    base: 118,
    variants: [
      [1.18, 0.82, 1.1, 1.22, 0.8, 1.02],
      [0.86, 1.2, 0.92, 1.06, 1.24, 0.84],
      [1.08, 0.94, 1.24, 0.8, 1.0, 1.16],
    ],
  },
  {
    id: "cs-paper",
    kind: "solid",
    fill: "#ffffff",
    cx: 300,
    cy: 160,
    base: 74,
    variants: [
      [1.22, 0.8, 1.12, 0.9, 1.18, 0.84],
      [0.82, 1.16, 0.94, 1.24, 0.86, 1.1],
      [1.04, 1.2, 0.78, 1.02, 1.14, 0.9],
    ],
  },
  {
    id: "cs-ring2",
    kind: "ring",
    stroke: "#979797",
    width: 2,
    cx: 128,
    cy: 366,
    base: 62,
    variants: [
      [0.9, 1.22, 0.82, 1.12, 1.0, 1.18],
      [1.18, 0.86, 1.14, 0.9, 1.2, 0.8],
      [0.8, 1.1, 1.24, 0.86, 1.08, 0.94],
    ],
  },
  {
    id: "cs-mint",
    kind: "solid",
    fill: "#d1ffca",
    cx: 348,
    cy: 356,
    base: 46,
    variants: [
      [1.16, 0.84, 1.04, 1.22, 0.8, 1.1],
      [0.84, 1.2, 0.9, 0.78, 1.24, 0.96],
      [1.1, 0.9, 1.2, 0.82, 1.0, 1.18],
    ],
  },
  {
    id: "cs-volt",
    kind: "solid",
    fill: "#fff100",
    cx: 96,
    cy: 128,
    base: 34,
    variants: [
      [0.94, 1.16, 0.8, 1.24, 0.9, 1.06],
      [1.22, 0.78, 1.1, 0.92, 1.18, 0.84],
      [0.82, 1.24, 0.96, 1.0, 0.78, 1.2],
    ],
  },
] as const;

const restPath = (s: (typeof SHAPES)[number]) =>
  blobPath(s.variants[0], s.cx, s.cy, s.base);

export function BriefShapes() {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        const loops: gsap.core.Timeline[] = [];

        SHAPES.forEach((s, i) => {
          const el = scope.current?.querySelector(`#${s.id}`);
          if (!el) return;

          const tl = gsap.timeline({ repeat: -1, paused: true });
          // Ends on variants[0] — the shape actually authored in the markup —
          // so the loop closes where the static composition sits.
          [s.variants[1], s.variants[2], s.variants[0]].forEach((radii) => {
            tl.to(el, {
              morphSVG: {
                shape: blobPath(radii, s.cx, s.cy, s.base),
                type: "rotational",
                origin: "50% 50%",
              },
              // Slower and more spread out than the hero's 5.5+0.6i: this sits
              // beside a form someone is reading, not behind a headline.
              duration: 6.5 + i * 0.7,
              ease: "sine.inOut",
            });
          });

          // Prime numbers of phase, so the six never line up into a pulse.
          tl.progress((i * 0.17 + 0.11) % 1);
          loops.push(tl);
        });

        // Nothing morphs while it is off screen; rAF is not free.
        const st = ScrollTrigger.create({
          trigger: scope.current,
          start: "top bottom",
          end: "bottom top",
          onToggle: ({ isActive }) =>
            loops.forEach((t) => (isActive ? t.play() : t.pause())),
        });

        return () => {
          st.kill();
          loops.forEach((t) => t.kill());
        };
      });

      return () => mm.revert();
    },
    { scope },
  );

  return (
    <div ref={scope} className="w-full">
      {/* Abstract shapes tell a screen reader nothing. */}
      <svg viewBox="0 0 440 480" className="h-auto w-full" aria-hidden>
        {SHAPES.map((s) =>
          s.kind === "ring" ? (
            <path
              key={s.id}
              id={s.id}
              d={restPath(s)}
              fill="none"
              stroke={s.stroke}
              strokeWidth={s.width}
            />
          ) : (
            <path key={s.id} id={s.id} d={restPath(s)} fill={s.fill} />
          ),
        )}
      </svg>
    </div>
  );
}
