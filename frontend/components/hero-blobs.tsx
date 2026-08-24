"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { useGSAP } from "@gsap/react";
import { isDocumentVisible, MOTION_OK } from "@/lib/motion";
import { blobPath } from "@/lib/blob";

gsap.registerPlugin(useGSAP, ScrollTrigger, MorphSVGPlugin);

/**
 * Palette note — this is a design-contract decision, not an accident.
 * AGENTS.md: "mint is for tags and links only, voltage for micro-accents only.
 * Neither goes on a large surface." So carbon / paper / ash carry the mass and
 * mint / voltage are only ever the two SMALLEST blobs.
 */
/**
 * Radii swing roughly 0.72–1.30. A narrower range (say 0.9–1.1) reads as a
 * rounded octagon — a squircle, not a drop — because 8 evenly-spaced points
 * with gentle offsets is geometrically almost a circle. The irregular,
 * non-alternating sequences are deliberate: strict high/low alternation looks
 * like a flower.
 */
const BLOBS = [
  {
    id: "b1",
    fill: "#000000",
    cx: 232,
    cy: 272,
    base: 140,
    shapes: [
      [1.18, 0.8, 1.06, 1.24, 0.76, 1.12, 0.88, 1.02],
      [0.84, 1.22, 0.9, 1.08, 1.26, 0.78, 1.16, 0.94],
      [1.1, 0.94, 1.26, 0.82, 1.0, 1.2, 0.74, 1.08],
    ],
  },
  {
    id: "b2",
    fill: "#ffffff",
    cx: 118,
    cy: 142,
    base: 88,
    shapes: [
      [1.24, 0.78, 1.12, 0.9, 1.2, 0.74, 1.06, 0.96],
      [0.8, 1.16, 0.94, 1.26, 0.84, 1.1, 0.9, 1.22],
      [1.06, 1.22, 0.76, 1.04, 1.18, 0.86, 1.24, 0.8],
    ],
  },
  {
    id: "b3",
    fill: "#c6c6c6",
    cx: 352,
    cy: 148,
    base: 72,
    shapes: [
      [0.9, 1.26, 0.8, 1.1, 1.02, 0.76, 1.22, 0.94],
      [1.2, 0.84, 1.14, 0.9, 0.76, 1.24, 0.96, 1.08],
      [0.78, 1.08, 1.26, 0.84, 1.12, 0.94, 0.9, 1.2],
    ],
  },
  {
    id: "b4",
    fill: "#d1ffca",
    cx: 344,
    cy: 404,
    base: 66,
    shapes: [
      [1.16, 0.86, 1.02, 1.24, 0.78, 1.1, 0.9, 1.06],
      [0.82, 1.2, 0.92, 0.76, 1.26, 0.96, 1.14, 0.86],
      [1.08, 0.9, 1.22, 0.8, 0.98, 1.18, 0.76, 1.12],
    ],
  },
  {
    id: "b5",
    fill: "#fff100",
    cx: 104,
    cy: 404,
    base: 50,
    shapes: [
      [0.94, 1.14, 0.82, 1.24, 0.9, 1.04, 1.18, 0.76],
      [1.22, 0.78, 1.08, 0.94, 1.16, 0.84, 0.9, 1.26],
      [0.8, 1.26, 0.96, 1.02, 0.76, 1.2, 1.1, 0.9],
    ],
  },
] as const;

/** Resting shape = the first variant. Rendered inline so it exists without JS. */
const restPath = (b: (typeof BLOBS)[number]) =>
  blobPath(b.shapes[0], b.cx, b.cy, b.base);

export function HeroBlobs() {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        // Without this the "from" state below is applied and then freezes,
        // because rAF does not run in a background tab. See lib/motion.ts.
        if (!isDocumentVisible()) return;

        const loops: gsap.core.Timeline[] = [];

        BLOBS.forEach((b, i) => {
          const el = scope.current?.querySelector(`#${b.id}`);
          if (!el) return;

          const tl = gsap.timeline({ repeat: -1, paused: true });
          // …shapes[1], [2], then back to [0] so the loop closes on the shape
          // that is actually authored in the markup.
          [b.shapes[1], b.shapes[2], b.shapes[0]].forEach((radii) => {
            tl.to(el, {
              morphSVG: {
                shape: blobPath(radii, b.cx, b.cy, b.base),
                type: "rotational",
                origin: "50% 50%",
              },
              duration: 5.5 + i * 0.6,
              ease: "sine.inOut",
            });
          });

          // Offset the phase — blobs pulsing in unison read as a loading spinner.
          tl.progress(i * 0.21);
          loops.push(tl);
        });

        gsap.from(scope.current?.querySelectorAll("path") ?? [], {
          scale: 0.88,
          opacity: 0,
          transformOrigin: "50% 50%",
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.08,
          // Behind the headline's own timeline (delay 0.15) so type still leads.
          delay: 0.35,
          onComplete: () => loops.forEach((t) => t.play()),
        });

        // Don't burn rAF on a morph nobody can see.
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
      {/* Abstract shapes carry no information a screen reader needs. */}
      <svg viewBox="0 0 440 520" className="h-auto w-full" aria-hidden>
        {BLOBS.map((b) => (
          <path key={b.id} id={b.id} d={restPath(b)} fill={b.fill} />
        ))}
      </svg>
    </div>
  );
}
