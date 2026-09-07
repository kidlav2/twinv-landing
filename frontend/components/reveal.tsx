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
 * `group` is the opposite arrangement, for the one shape where per-element
 * triggers are wrong: a block that is exactly as tall as the window and has
 * to be read as a single picture. The case gallery is that block — a large
 * frame with a strip of thumbnails under it. With a trigger per element the
 * thumbnails only cross their own start line once the heading has already
 * left the top of the screen, so a reader arriving at a full-bleed frame with
 * empty space beneath it has no way to know there are eight more shots. One
 * trigger on the wrapper brings the whole thing in together.
 *
 * It is an opt-in for that reason, not a better default: on a tall section
 * (Services, the work index) a single wrapper trigger is exactly the bug the
 * paragraph above describes.
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
  group = false,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  y?: number;
  start?: string;
  /** One trigger on the wrapper instead of one per element. Only for blocks
   *  that fit the window and read as a single composition. */
  group?: boolean;
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

        const enter = (batch: Element[]) =>
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
          });

        if (group) {
          ScrollTrigger.create({
            trigger: scope.current,
            start,
            once: true,
            onEnter: () => enter(targets),
          });
          return;
        }

        ScrollTrigger.batch(targets, {
          start,
          once: true,
          onEnter: enter,
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
