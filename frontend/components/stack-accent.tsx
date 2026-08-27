"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { isDocumentVisible, MOTION_OK } from "@/lib/motion";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * A corner accent for Stack — the section was reading as "empty", not
 * "restrained": a centred heading and a few rows of chips with nothing else
 * on a wide screen. This is deliberately minor (a slowly turning cluster,
 * tucked into a corner) rather than a second hero-scale visual — the content
 * here is the chip list, not this.
 *
 * The two instances are NOT mirrored bookends, and the left one is pinned to
 * the BOTTOM of the section for a measured reason: the widest thing here is
 * not the heading (a centred 46ch column) but the chip rows, which fill the
 * shell. The last group is the shortest (Android, two chips), so only that
 * row leaves a gutter wide enough for the 208px accent. Anchoring to the
 * bottom puts it beside that row at every width instead of guessing a
 * vertical offset. `xl:` and up only; below that even the last row is tight.
 */
export function StackAccent({ side = "right" }: { side?: "left" | "right" }) {
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
          // Different periods per side. A matched pair turning in lockstep
          // reads as a loading spinner, not as decoration.
          duration: side === "left" ? 18 : 14,
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
      className={
        "text-line pointer-events-none absolute hidden opacity-70 " +
        (side === "left"
          ? "bottom-6 left-6 xl:block xl:left-12"
          : "top-10 right-6 md:block lg:right-12")
      }
      aria-hidden
    >
      {/* Mirrored on the <svg>, never on the <g>: Tailwind v4 compiles
          `scale-x-*` to the standalone `scale:` property while GSAP writes
          `transform: rotate()` on `.accent-group`. On one element the two
          would multiply; on parent and child they compose cleanly. */}
      <svg
        viewBox="0 0 120 120"
        className={
          "h-24 w-24 lg:h-36 lg:w-36 xl:h-52 xl:w-52 " +
          (side === "left" ? "scale-x-[-1]" : "")
        }
      >
        <g className="accent-group">
          {/* The cluster tops out at 208px instead of 112px, so the two
              chromatic discs shrink inside the viewBox to compensate (r 10 -> 8
              and 7 -> 5.5). Mint and voltage are micro-accents; scaling them
              with the box would turn them into the large chromatic surface the
              system forbids. The neutral square absorbs the extra size.

              The size ladder is gated on measurement, not taste: the heading
              fills its 46ch column, so at 768px a 144px cluster overlaps the
              last glyph by 23px. 96 -> 144 at lg -> 208 at xl each clear the
              nearest text by 25px or more.

              Same reason the right accent starts at `md:` and not `sm:`: at
              640px the shell leaves no gutter at all and the 96px cluster ran
              21px into the headline. That overlap predates this change; it is
              fixed here because it is the same measurement. */}
          {/* Geometry is constrained by the ROTATION, not by the resting
              layout: the group spins about (60,60), so every shape sweeps a
              circle of radius `distance-from-centre + its own extent`, and
              anything over 60 leaves the viewBox and gets sliced by the SVG
              viewport for part of each turn. This square's far corner sits at
              hypot(40,40) + half the stroke = 57.6. An earlier pass had it at
              x/y 12 with size 38, which reaches 68.9 — 8.9 outside the frame,
              which is why a corner kept being clipped mid-rotation. */}
          <rect
            x="20"
            y="20"
            width="34"
            height="34"
            rx="8"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx="92" cy="30" r="8" fill="#d1ffca" />
          <circle cx="88" cy="92" r="5.5" fill="#fff100" />
        </g>
      </svg>
    </div>
  );
}
