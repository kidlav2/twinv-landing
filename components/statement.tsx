"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { statement } from "@/lib/content";
import { isDocumentVisible, MOTION_OK, REVEAL } from "@/lib/motion";
import { StatementCursor } from "./statement-cursor";
import { StatementDoodle } from "./statement-doodle";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * The line reveals left-to-right via a clip-path wipe rather than the fade
 * used elsewhere — reads as it being "typed" into place, which suits sitting
 * flush against the shell's left edge instead of centered.
 */
export function Statement() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        if (!isDocumentVisible()) return;

        // The clip wipe is this section's signature — deliberately not the
        // shared fade. Only its timing is aligned to the site's ease.
        gsap.set(".statement-line", { clipPath: "inset(0 100% 0 0)" });
        gsap.to(".statement-line", {
          clipPath: "inset(0 0% 0 0)",
          duration: 1,
          ease: REVEAL.ease,
          scrollTrigger: { trigger: scope.current, start: "top 75%", once: true },
        });

        gsap.from(".statement-fact", {
          opacity: 0,
          y: REVEAL.y,
          duration: REVEAL.duration,
          ease: REVEAL.ease,
          stagger: REVEAL.stagger,
          scrollTrigger: { trigger: scope.current, start: "top 60%", once: true },
        });
      });

      return () => mm.revert();
    },
    { scope },
  );

  return (
    <section ref={scope} className="relative overflow-hidden py-32">
      {/* Clips at the section edge, not the viewport, so the cursor circle
          never paints over the nav or neighbouring sections. */}
      <StatementCursor />

      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-[1fr_auto] lg:items-start lg:gap-16">
          <div className="flex flex-col items-start text-left">
            <p className="statement-line font-display max-w-[20ch] text-display">
              {statement.body}
            </p>

            <ul className="mt-16 flex flex-col gap-6">
              {statement.facts.map((fact) => (
                <li
                  key={fact}
                  className="statement-fact text-fg max-w-[40ch] text-lead"
                >
                  {fact}
                </li>
              ))}
            </ul>
          </div>

          <div className="reveal pt-6">
            <StatementDoodle />
          </div>
        </div>
      </div>
    </section>
  );
}
