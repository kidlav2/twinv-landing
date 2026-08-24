"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { isDocumentVisible, MOTION_OK, REVEAL } from "@/lib/motion";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Scroll-reveals every descendant carrying `.reveal`.
 *
 * Uses `ScrollTrigger.batch`, which creates a trigger per element rather than
 * one for the whole wrapper. That distinction matters on tall sections: with a
 * single wrapper trigger, a 5-row Services list keyed to the section's top has
 * already finished animating its last row long before that row is on screen.
 * `batch` reveals each element against its own position, while elements that
 * arrive together still stagger together.
 *
 * Motion is gated behind matchMedia, so reduced-motion users get the finished
 * layout with no animation at all.
 */
export function Reveal({
  children,
  className = "",
  stagger = REVEAL.stagger,
  y = REVEAL.y,
  start = REVEAL.start,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  y?: number;
  start?: string;
}) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        // MUST stay above the gsap.set below. `batch` animates with `.to()`,
        // which needs a pre-hidden state — and in a background tab no scroll
        // events fire, so onEnter never runs. Hiding first and bailing after
        // would leave every below-fold element invisible forever. This is the
        // exact failure lib/motion.ts exists to prevent.
        if (!isDocumentVisible()) return;

        const targets = gsap.utils.toArray<HTMLElement>(".reveal");
        if (!targets.length) return;

        gsap.set(targets, { opacity: 0, y, willChange: "transform,opacity" });

        ScrollTrigger.batch(targets, {
          start,
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              opacity: 1,
              y: 0,
              duration: REVEAL.duration,
              ease: REVEAL.ease,
              stagger: { each: stagger },
              overwrite: true,
              // will-change is a promise to the compositor, not a decoration —
              // release it once the element has stopped moving.
              onComplete: () => gsap.set(batch, { clearProps: "willChange" }),
            }),
        });
      });

      return () => mm.revert();
    },
    { scope },
  );

  return (
    <div ref={scope} className={className}>
      {children}
    </div>
  );
}
