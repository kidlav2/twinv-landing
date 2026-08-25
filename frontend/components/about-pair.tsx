"use client";

import { useRef } from "react";
import gsap from "gsap";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { useGSAP } from "@gsap/react";
import { isDocumentVisible, MOTION_OK } from "@/lib/motion";
import { blobPath, blobRadii } from "@/lib/blob";
import { pointerField } from "@/lib/pointer-field";

gsap.registerPlugin(useGSAP, MorphSVGPlugin);

/**
 * Two shapes that drift, overlap, and lean apart around the pointer.
 *
 * This replaces the contents list that used to sit here. That list looked like
 * a set of dropdowns and behaved like anchors — an affordance the page did not
 * honour — and on a three-section page it was navigation nobody needed.
 *
 * It is two shapes rather than a field of them because the page's whole claim
 * is that the studio is two people: the pair reads as the subject, and moving
 * the cursor pushes them apart and lets them settle back together. The blob
 * vocabulary is the site's own (hero, service pages), so this is the existing
 * language used for something specific, not a new one.
 *
 * Depths are opposite in sign, which is what makes the pair separate under the
 * cursor instead of sliding along with it as one object.
 */

/**
 * Palette is the contract, not taste. With only two shapes in the frame,
 * either of them counts as a large surface — so both carry neutrals, exactly
 * as the hero puts carbon/paper/ash on its big blobs. The single voltage dot
 * is the one accent, and a micro-accent is the only role that colour has.
 *
 * Grey on the left, black on the right — the shape's own reading order runs
 * light to dark toward the corner it sits in, which is what keeps the pair
 * from reading as two unrelated blobs that happen to overlap.
 */
/**
 * Landscape, and the shapes fill it.
 *
 * It was a square box at the full width of its column, which made the row it
 * sits in as tall as that column is wide — and with the row centred, a short
 * paragraph beside it floated in the middle of a 555px void. A wide box keeps
 * the row short, and letting the blobs run to the edges of it is what makes
 * them read large instead of like a small drawing in a big frame.
 *
 * `base * 1.28` is the furthest a radius can push (see lib/blob.ts), so that
 * is the figure the bounds below are checked against.
 */
const VB_W = 620;
const VB_H = 420;

const A = {
  seed: 0x2f61,
  cx: 236,
  cy: 210,
  base: 150,
  fill: "var(--color-ash)",
};
const B = {
  seed: 0x91c3,
  cx: 428,
  cy: 248,
  base: 116,
  fill: "var(--color-carbon)",
};

/**
 * Pulls `blobRadii`'s 0.74–1.28 swing in toward 1 before it ever reaches a
 * path — local to this pair, not a change to `lib/blob.ts`, which the hero
 * and the service pages also read and whose wider swing is right for them.
 *
 * Two shapes reads very differently from the hero's five: with only two on
 * screen, each one is a large surface, and the full swing produced sharp,
 * almost spiky lobes that looked aggressive rather than calm at that scale.
 * 0.5 keeps the same eight seeded points (so the morph still has somewhere
 * to go) but roughly halves how far each one travels from a circle.
 */
const SOFTEN = 0.5;
const soften = (radii: readonly number[]) =>
  radii.map((r) => 1 + (r - 1) * SOFTEN);

const SHAPES = {
  a: [A.seed, A.seed + 1, A.seed + 2].map((s) => soften(blobRadii(s))),
  b: [B.seed, B.seed + 1, B.seed + 2].map((s) => soften(blobRadii(s))),
};

export function AboutPair({ className = "" }: { className?: string }) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;

      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        // The morph tweens away from the shape authored in the markup, and a
        // background tab would freeze it partway. Nothing here hides anything,
        // so bailing simply leaves the two resting shapes on screen.
        if (!isDocumentVisible()) return;

        const loops: gsap.core.Timeline[] = [];

        (["a", "b"] as const).forEach((key, i) => {
          const el = root.querySelector(`#pair-${key}`);
          if (!el) return;
          const cfg = key === "a" ? A : B;

          const tl = gsap.timeline({ repeat: -1 });
          // …variants 1 and 2, then home, so the loop closes on the shape the
          // server actually rendered.
          [SHAPES[key][1], SHAPES[key][2], SHAPES[key][0]].forEach((radii) => {
            tl.to(el, {
              morphSVG: {
                shape: blobPath(radii, cfg.cx, cfg.cy, cfg.base),
                type: "rotational",
                origin: "50% 50%",
              },
              // Slower than the hero's blobs on top of the softened radii —
              // two large, near-still shapes read as calm; the hero's five
              // small ones could afford to be livelier.
              duration: 10 + i * 2,
              ease: "sine.inOut",
            });
          });
          tl.progress(i * 0.35);
          loops.push(tl);
        });

        const release = pointerField(
          root,
          [
            { el: root.querySelector("#pair-a")!, depth: -0.8 },
            { el: root.querySelector("#pair-b")!, depth: 1 },
            { el: root.querySelector("#pair-dot")!, depth: 1.35 },
          ],
          { max: 20, duration: 1 },
        );

        return () => {
          loops.forEach((t) => t.kill());
          release();
        };
      });

      return () => mm.revert();
    },
    { scope },
  );

  return (
    /* The box carries the viewBox's own ratio, so a caller only ever sets one
       dimension and the other follows exactly — no letterboxed band of empty
       space inside the box, and no `w-auto` circularity when the box is the
       shrink-to-fit child of an absolutely positioned layer. */
    <div
      ref={scope}
      className={className || "w-full"}
      style={{ aspectRatio: `${VB_W} / ${VB_H}` }}
    >
      {/* Abstract shapes carry nothing a screen reader needs. */}
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="h-full w-full" aria-hidden>
        <path
          id="pair-a"
          d={blobPath(SHAPES.a[0], A.cx, A.cy, A.base)}
          fill={A.fill}
        />
        <path
          id="pair-b"
          d={blobPath(SHAPES.b[0], B.cx, B.cy, B.base)}
          fill={B.fill}
        />
        {/* Sits where the two overlap. Rides the second shape's lean, so the
            pair keeps a visible join as they separate. */}
        <circle
          id="pair-dot"
          cx="342"
          cy="236"
          r="14"
          fill="var(--color-voltage)"
        />
      </svg>
    </div>
  );
}
