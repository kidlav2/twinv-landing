"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { HOVER_OK } from "@/lib/motion";

gsap.registerPlugin(useGSAP);

/**
 * A circle that follows the pointer inside its parent section and inverts
 * whatever it sits over via `mix-blend-mode: difference` — white on black
 * becomes black, black on canvas becomes the inverse, headline text under it
 * flips too. One mechanism covers both things asked for: a trailing cursor
 * area, and words contrasting on hover — there's no per-word logic, the blend
 * mode does it for free wherever the circle happens to be.
 *
 * Desktop-only: `HOVER_OK` requires a fine pointer, so touch never sees a
 * circle it can't move independently of a tap.
 */
export function StatementCursor() {
  const dot = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const el = dot.current;
    const section = el?.parentElement;
    if (!el || !section) return;

    const mm = gsap.matchMedia();

    mm.add(HOVER_OK, () => {
      const moveX = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" });
      const moveY = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" });

      const move = (e: PointerEvent) => {
        const r = section.getBoundingClientRect();
        moveX(e.clientX - r.left);
        moveY(e.clientY - r.top);
      };
      const enter = () => gsap.to(el, { scale: 1, duration: 0.25 });
      const leave = () => gsap.to(el, { scale: 0, duration: 0.25 });

      section.addEventListener("pointermove", move);
      section.addEventListener("pointerenter", enter);
      section.addEventListener("pointerleave", leave);

      return () => {
        section.removeEventListener("pointermove", move);
        section.removeEventListener("pointerenter", enter);
        section.removeEventListener("pointerleave", leave);
      };
    });

    return () => mm.revert();
  }, {});

  return (
    <div
      ref={dot}
      aria-hidden
      className="pointer-events-none absolute top-0 left-0 z-20 h-32 w-32 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-white mix-blend-difference"
    />
  );
}
