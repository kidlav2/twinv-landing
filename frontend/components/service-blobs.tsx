"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { useGSAP } from "@gsap/react";
import { isDocumentVisible, MOTION_OK } from "@/lib/motion";
import { blobPath, blobRadii } from "@/lib/blob";

gsap.registerPlugin(useGSAP, ScrollTrigger, MorphSVGPlugin);

/**
 * The hero's morphing blobs, reused at service-page scale — the same
 * generator, the same morph mechanics, a different arrangement per service.
 * Reusing the system rather than inventing a second visual language is the
 * point: a service page that animates in a way the homepage never does reads
 * as a different site.
 *
 * Palette is the same design-contract call HeroBlobs documents: carbon /
 * paper / ash carry the mass, and mint / voltage are only ever the two
 * SMALLEST blobs in a layout. Every arrangement below is ordered largest
 * first for exactly that reason — if you add one, keep mint and voltage last
 * and smallest.
 *
 * Every `base` is measured against `base * 1.28` (blobRadii's ceiling): a
 * blob centred at cx with that reach must stay inside the 0–400 viewBox, or
 * it gets sliced by the SVG viewport for part of each morph.
 */

const CARBON = "#000000";
const PAPER = "#ffffff";
const ASH = "#c6c6c6";
const MINT = "#d1ffca";
const VOLT = "#fff100";

type Blob = { fill: string; cx: number; cy: number; base: number };

/**
 * Keyed by service slug. Each composition says something about its service
 * rather than being blobs shuffled: a page composed around a centre, two
 * states overlapping, a catalog grid, a dominant mark, a rising diagonal, a
 * cycle around a hub. Counts vary (5–7) for the same reason.
 *
 * TWO constraints bind every layout here.
 *
 * 1. Mint and voltage are the two SMALLEST blobs, always — the design
 *    contract keeps them off large surfaces. Entries are ordered largest
 *    first so this is checkable by reading down the list.
 *
 * 2. Mint and voltage sit in the LOWER third (centre y >= ~300). This one is
 *    new, and it is not taste: the service title is laid over these shapes
 *    with `mix-blend-mode: difference`, which is what turns black type white
 *    where it crosses a black blob. Difference against a chromatic backdrop
 *    is chromatic too — white over mint resolves to a dark purple and over
 *    voltage to pure blue, so a letter crossing either would simply look
 *    broken. Grayscale differences stay grayscale, so carbon / paper / ash
 *    are safe anywhere; the accents are kept below the type instead.
 */
const LAYOUTS: Record<string, Blob[]> = {
  // One dominant form with satellites — a page composed around a centre.
  "website-design": [
    { fill: CARBON, cx: 190, cy: 180, base: 138 },
    { fill: PAPER, cx: 92, cy: 96, base: 66 },
    { fill: ASH, cx: 320, cy: 120, base: 62 },
    { fill: MINT, cx: 320, cy: 320, base: 40 },
    { fill: VOLT, cx: 96, cy: 330, base: 26 },
  ],
  // Two large forms overlapping — the old site and the new one, sharing edges.
  redesign: [
    { fill: CARBON, cx: 160, cy: 170, base: 122 },
    { fill: PAPER, cx: 262, cy: 180, base: 104 },
    { fill: ASH, cx: 330, cy: 72, base: 52 },
    { fill: MINT, cx: 108, cy: 338, base: 36 },
    { fill: VOLT, cx: 236, cy: 352, base: 24 },
  ],
  // Overlapping panels — an app, a dashboard, a portal sharing one system.
  "digital-products": [
    { fill: CARBON, cx: 118, cy: 116, base: 84 },
    { fill: PAPER, cx: 282, cy: 112, base: 80 },
    { fill: ASH, cx: 116, cy: 262, base: 76 },
    { fill: CARBON, cx: 286, cy: 258, base: 72 },
    { fill: MINT, cx: 200, cy: 336, base: 38 },
    { fill: VOLT, cx: 66, cy: 352, base: 20 },
  ],
  // One body, held by a tight cluster — a device and the screens it carries.
  "android-development": [
    { fill: CARBON, cx: 196, cy: 185, base: 140 },
    { fill: PAPER, cx: 318, cy: 300, base: 58 },
    { fill: ASH, cx: 74, cy: 300, base: 50 },
    { fill: MINT, cx: 96, cy: 338, base: 32 },
    { fill: VOLT, cx: 300, cy: 352, base: 22 },
  ],
  // A diagonal that grows toward the top right.
  "care-growth": [
    { fill: CARBON, cx: 256, cy: 148, base: 112 },
    { fill: PAPER, cx: 148, cy: 232, base: 86 },
    { fill: ASH, cx: 76, cy: 326, base: 56 },
    { fill: MINT, cx: 190, cy: 344, base: 34 },
    { fill: VOLT, cx: 340, cy: 330, base: 24 },
  ],
  // A ring handing work around a hub. The hub is ash rather than an accent
  // colour precisely because it sits dead centre, under the type.
  "digital-solutions": [
    { fill: CARBON, cx: 200, cy: 88, base: 62 },
    { fill: PAPER, cx: 308, cy: 196, base: 58 },
    { fill: ASH, cx: 200, cy: 304, base: 56 },
    { fill: CARBON, cx: 92, cy: 196, base: 54 },
    { fill: ASH, cx: 200, cy: 196, base: 30 },
    { fill: MINT, cx: 62, cy: 336, base: 28 },
    { fill: VOLT, cx: 330, cy: 340, base: 22 },
  ],
};

const FALLBACK = LAYOUTS["website-design"];

/** A stable per-service offset, so two services never seed the same shapes. */
function seedFor(slug: string) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return h;
}

export function ServiceBlobs({ slug }: { slug: string }) {
  const scope = useRef<HTMLDivElement>(null);
  const blobs = LAYOUTS[slug] ?? FALLBACK;
  const seed = seedFor(slug);

  /** Three shapes per blob. Index 0 is what renders in the markup, so the
   *  loop must close back onto it. */
  const shapes = blobs.map((b, i) =>
    [0, 1, 2].map((v) => blobRadii(seed + i * 31 + v * 7)),
  );

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        // Same guard as HeroBlobs: rAF does not advance in a background tab,
        // so a `from` state applied there would freeze. See lib/motion.ts.
        if (!isDocumentVisible()) return;

        const paths = scope.current?.querySelectorAll("path");
        if (!paths?.length) return;

        const loops: gsap.core.Timeline[] = [];

        blobs.forEach((b, i) => {
          const el = paths[i];
          if (!el) return;

          const tl = gsap.timeline({ repeat: -1, paused: true });
          [shapes[i][1], shapes[i][2], shapes[i][0]].forEach((radii) => {
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

          // Offset the phase — blobs pulsing in unison read as a spinner.
          tl.progress(i * 0.21);
          loops.push(tl);
        });

        gsap.from(paths, {
          scale: 0.88,
          opacity: 0,
          transformOrigin: "50% 50%",
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.08,
          delay: 0.2,
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
    { scope, dependencies: [slug] },
  );

  return (
    <div ref={scope} className="w-full">
      {/* Abstract shapes carry no information a screen reader needs. */}
      <svg viewBox="0 0 400 400" className="h-auto w-full" aria-hidden>
        {blobs.map((b, i) => (
          <path
            key={`${b.fill}-${i}`}
            d={blobPath(shapes[i][0], b.cx, b.cy, b.base)}
            fill={b.fill}
          />
        ))}
      </svg>
    </div>
  );
}
