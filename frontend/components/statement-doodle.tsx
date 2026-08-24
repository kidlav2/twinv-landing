"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { useGSAP } from "@gsap/react";
import { isDocumentVisible, MOTION_OK } from "@/lib/motion";

gsap.registerPlugin(useGSAP, ScrollTrigger, DrawSVGPlugin);

/**
 * Small looping accent for the right side of Statement, which otherwise has
 * nothing on it past the text column's max-width. A ring draws itself in and
 * a dot rides its exact circumference (same centre, same radius as the ring,
 * so it can never leave the ring — no risk of the clipping bug fixed in
 * pillar-card.tsx). A few static ticks give it a instrument-panel feel rather
 * than a spinner.
 */
export function StatementDoodle() {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        if (!isDocumentVisible()) return;

        const ring = scope.current?.querySelector(".doodle-ring");
        const dot = scope.current?.querySelector(".doodle-dot");
        if (!ring || !dot) return;

        const tl = gsap.timeline({ repeat: -1, paused: true });
        tl.fromTo(
          ring,
          { drawSVG: "0% 0%" },
          { drawSVG: "0% 100%", duration: 2.4, ease: "power2.inOut" },
        ).to(
          dot,
          { rotation: 360, svgOrigin: "120 120", duration: 6, ease: "none" },
          0,
        );

        const st = ScrollTrigger.create({
          trigger: scope.current,
          start: "top bottom",
          end: "bottom top",
          onToggle: ({ isActive }) => (isActive ? tl.play() : tl.pause()),
        });

        return () => {
          st.kill();
          tl.kill();
        };
      });

      return () => mm.revert();
    },
    { scope },
  );

  return (
    <div ref={scope} className="hidden lg:block" aria-hidden>
      <svg viewBox="0 0 240 240" className="h-auto w-full max-w-[220px]">
        <circle
          className="doodle-ring"
          cx="120"
          cy="120"
          r="86"
          fill="none"
          stroke="#c6c6c6"
          strokeWidth="1.5"
        />
        <circle className="doodle-dot" cx="120" cy="34" r="7" fill="#d1ffca" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <line
            key={deg}
            x1="120"
            y1="18"
            x2="120"
            y2="28"
            stroke="#444444"
            strokeWidth="1.5"
            transform={`rotate(${deg} 120 120)`}
          />
        ))}
      </svg>
    </div>
  );
}
