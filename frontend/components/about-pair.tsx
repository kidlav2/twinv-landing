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
 */
const A = {
  seed: 0x2f61,
  cx: 168,
  cy: 168,
  base: 104,
  fill: "var(--color-carbon)",
};
const B = {
  seed: 0x91c3,
  cx: 250,
  cy: 214,
  base: 78,
  fill: "var(--color-ash)",
};

const SHAPES = {
  a: [blobRadii(A.seed), blobRadii(A.seed + 1), blobRadii(A.seed + 2)],
  b: [blobRadii(B.seed), blobRadii(B.seed + 1), blobRadii(B.seed + 2)],
};

export function AboutPair() {
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
              duration: 6.5 + i * 1.4,
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
    <div ref={scope} className="w-full">
      {/* Abstract shapes carry nothing a screen reader needs. */}
      <svg viewBox="0 0 380 380" className="h-auto w-full" aria-hidden>
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
          cx="214"
          cy="196"
          r="9"
          fill="var(--color-voltage)"
        />
      </svg>
    </div>
  );
}
