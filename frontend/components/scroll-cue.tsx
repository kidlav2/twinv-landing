"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { isDocumentVisible, MOTION_OK } from "@/lib/motion";

gsap.registerPlugin(useGSAP);

/**
 * A hairline with a mark travelling down it — the "there is more below" cue.
 *
 * No words. A "scroll down" label explains the interface to the reader in the
 * interface's own voice, which is the tell of a page that does not trust its
 * layout; a mark moving in the direction you can go says the same thing and
 * says it once. It is also the system's own vocabulary — a hairline is a
 * structural element here, not a decoration invented for this.
 *
 * The resting markup is the finished state: a rule with the mark parked at the
 * top. With no JS, reduced motion, or a background tab, it is a static tick on
 * a line, which still points down.
 */
export function ScrollCue({ className = "" }: { className?: string }) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mark = scope.current?.querySelector("[data-cue-mark]");
      if (!mark) return;

      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        // The loop moves the mark away from where the markup puts it, and rAF
        // does not advance in a background tab — bail and the parked mark
        // stands.
        if (!isDocumentVisible()) return;

        const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.5 });
        tl.fromTo(
          mark,
          { yPercent: 0, opacity: 0 },
          { opacity: 1, duration: 0.35, ease: "none" },
        )
          .to(mark, { yPercent: 240, duration: 1.5, ease: "power2.inOut" }, 0)
          .to(mark, { opacity: 0, duration: 0.4, ease: "none" }, 1.1);

        return () => tl.kill();
      });

      return () => mm.revert();
    },
    { scope },
  );

  return (
    <div
      ref={scope}
      aria-hidden
      className={`bg-line relative h-16 w-px overflow-hidden ${className}`}
    >
      <span data-cue-mark className="bg-carbon absolute inset-x-0 top-0 h-5" />
    </div>
  );
}
