"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { useGSAP } from "@gsap/react";
import { isDocumentVisible, MOTION_OK } from "@/lib/motion";
import { blobPath, blobRadii } from "@/lib/blob";
import { pointerField } from "@/lib/pointer-field";

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

/**
 * Everything below this line is the per-reload variation, and all of it runs
 * AFTER mount for one reason: the five paths and their fills are rendered on
 * the server. Anything random in the markup itself is a hydration mismatch.
 * So the server always emits the same authored composition, and the client
 * re-deals it once the entrance is already at opacity 0 — the swap is never
 * on screen.
 *
 * The three neutrals swap among the three LARGEST blobs only. Mint and
 * voltage stay pinned to b4 and b5, the two smallest, because the palette
 * rule in AGENTS.md is about surface area, not about which shape is which:
 * shuffling them into the 140-unit blob would put mint on a large surface.
 */
const NEUTRALS = ["#000000", "#ffffff", "#c6c6c6"] as const;

/** Fisher-Yates on a copy. Three items, so this is a shuffle, not a science. */
function shuffled<T>(items: readonly T[]): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * How the five paths arrive. Three of them, drawn at random, so a reload is a
 * different load-in rather than the same one replayed.
 *
 * `from` is a whole vars object per variant rather than a couple of tweaked
 * numbers: the variants differ in which property carries the motion (scale,
 * y, rotation) and in stagger origin, and a shared object with three
 * overrides reads as one animation with a dial on it. These are three.
 */
const ENTRANCES = [
  {
    /* The original: everything swells into place at once from the middle. */
    from: { scale: 0.88, opacity: 0 },
    stagger: { each: 0.08 },
  },
  {
    /* Drops in top-down. Small y, because the blobs sit in a tight column and
       a long fall reads as a page still loading. */
    from: { y: 46, scale: 0.96, opacity: 0 },
    stagger: { each: 0.1, from: "start" as const },
  },
  {
    /* Unwinds outward from the centre of the group. */
    from: { scale: 0.7, rotation: -14, opacity: 0 },
    stagger: { each: 0.09, from: "center" as const },
  },
];

/**
 * The character of the shapes themselves, re-drawn on every load.
 *
 * Randomising the radii alone was not enough, and the reason is worth writing
 * down: eight points in a 0.74–1.28 swing is one silhouette with the dial
 * turned, so every draw produced a different array of numbers and the same
 * blob to look at. Point count is what actually changes the character — six
 * gives broad slow lobes, ten gives a smoother, busier edge — and the swing
 * has to move with it, because a wide swing over ten points is spikes and a
 * narrow one over eight is the rounded octagon lib/blob.ts warns about.
 *
 * `speed` rides along because a shape with fewer, larger lobes travelling at
 * the same rate reads as faster than it is.
 *
 * `max` stays at or under 1.28 in every mood: the layout is measured against
 * `base * 1.3` and these five blobs sit close together in a 440×520 box.
 */
const MOODS = [
  /* Few, broad lobes — the slowest and the most liquid. */
  { points: 6, min: 0.78, max: 1.26, speed: 1.2 },
  /* The authored character, unchanged. */
  { points: 8, min: 0.74, max: 1.28, speed: 1 },
  /* Smoother outline, more of it moving, and quicker with it. */
  { points: 10, min: 0.88, max: 1.16, speed: 0.85 },
];

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

        // One seed for the whole composition, so the five blobs are a set
        // drawn together rather than five independent dice rolls.
        const seed = (Math.random() * 0xffffffff) >>> 0;
        const entrance = ENTRANCES[Math.floor(Math.random() * ENTRANCES.length)];
        const neutrals = shuffled(NEUTRALS);
        const mood = MOODS[Math.floor(Math.random() * MOODS.length)];

        BLOBS.forEach((b, i) => {
          const el = scope.current?.querySelector(`#${b.id}`);
          if (!el) return;

          // Only the three big ones are in the deal; b4/b5 keep mint and
          // voltage. Set, not tweened — the entrance has these at opacity 0.
          if (i < 3) gsap.set(el, { fill: neutrals[i] });

          /* Three shapes, all generated, at this load's point count. The
             authored `shapes[0]` is deliberately NOT one of them any more.
             It used to close the cycle so the loop returned to the shape in
             the markup, but that pinned every load to eight points — and the
             point count is the thing that makes one reload look different
             from the last. blobRadii still guarantees what MorphSVG needs
             within a cycle: same count, same winding, same start point across
             all three. See lib/blob.ts. */
          const cycle = [0, 1, 2].map((n) =>
            blobPath(
              blobRadii(seed + i * 1013 + n * 7919, mood.points, mood.min, mood.max),
              b.cx,
              b.cy,
              b.base,
            ),
          );

          /* The one crossing between eight points and this load's count, done
             instantly rather than tweened. A timeline set to `repeat: -1`
             replays from the values it recorded on its first pass, so if this
             transition lived inside the loop the shape would snap back to the
             SSR path once per cycle — a visible pop every twenty seconds.
             Invisible here: the entrance tween below is a `from`, so opacity
             is already 0 in this same tick. */
          gsap.set(el, {
            morphSVG: { shape: cycle[0], type: "rotational", origin: "50% 50%" },
          });

          const tl = gsap.timeline({ repeat: -1, paused: true });
          [cycle[1], cycle[2], cycle[0]].forEach((shape) => {
            tl.to(el, {
              morphSVG: { shape, type: "rotational", origin: "50% 50%" },
              duration: (5.5 + i * 0.6) * mood.speed,
              ease: "sine.inOut",
            });
          });

          // Offset the phase — blobs pulsing in unison read as a loading spinner.
          tl.progress(i * 0.21);
          loops.push(tl);
        });

        let releasePointer: (() => void) | null = null;

        gsap.from(scope.current?.querySelectorAll("path") ?? [], {
          ...entrance.from,
          transformOrigin: "50% 50%",
          duration: 0.9,
          ease: "power3.out",
          stagger: entrance.stagger,
          // Behind the headline's own timeline (delay 0.15) so type still leads.
          delay: 0.35,
          onComplete: () => {
            loops.forEach((t) => t.play());

            // Only now. The entrance above animates `scale` on these very
            // paths, and the pointer lean writes `x`/`y` to the same transform
            // matrix — starting it early would have the two overwrite each
            // other mid-flight and leave a blob parked at 0.88.
            //
            // Depth per blob, largest moving least: a composition where
            // everything slides by the same amount reads as one flat sheet
            // being dragged, not as shapes at different distances. Signs are
            // mixed on purpose so the group opens and closes around the
            // cursor instead of marching with it.
            releasePointer = pointerField(
              scope.current!,
              BLOBS.map((b, i) => ({
                el: scope.current!.querySelector(`#${b.id}`)!,
                depth: [0.35, -0.7, 0.85, -0.95, 1][i] ?? 0.5,
              })),
              { max: 22, duration: 1.1 },
            );
          },
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
          // May still be null if the entrance never completed.
          releasePointer?.();
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
