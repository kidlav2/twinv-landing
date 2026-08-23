"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { isDocumentVisible, MOTION_OK } from "@/lib/motion";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * A small corner accent for Stack — the section was reading as "empty", not
 * "restrained": a centred heading and a few rows of chips with nothing else
 * on a wide screen. This is deliberately minor (a slowly turning cluster,
 * tucked into the corner) rather than a second hero-scale visual — the
 * content here is the chip list, not this.
 */
export function StackAccent() {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        if (!isDocumentVisible()) return;

        const group = scope.current?.querySelector(".accent-group");
        if (!group) return;

        const tl = gsap.timeline({ repeat: -1, paused: true });
        tl.to(group, {
          rotation: 360,
          svgOrigin: "60 60",
          duration: 14,
          ease: "none",
        });

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
    <div
      ref={scope}
      className="pointer-events-none absolute top-10 right-6 hidden opacity-70 sm:block lg:right-12"
      aria-hidden
    >
      <svg viewBox="0 0 120 120" className="h-24 w-24 lg:h-28 lg:w-28">
        <g className="accent-group">
          <rect
            x="18"
            y="18"
            width="28"
            height="28"
            rx="6"
            fill="none"
            stroke="#c6c6c6"
            strokeWidth="2"
          />
          <circle cx="92" cy="30" r="10" fill="#d1ffca" />
          <circle cx="88" cy="92" r="7" fill="#fff100" />
        </g>
      </svg>
    </div>
  );
}
