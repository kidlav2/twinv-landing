"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { HOVER_OK } from "@/lib/motion";

gsap.registerPlugin(useGSAP);

/**
 * A circle that follows the pointer inside its parent section and inverts
 * whatever it sits over via `mix-blend-mode: difference` — white on black
 * becomes black, text under it flips too. Started out scoped to the Statement
 * section only; moved to cover the whole dark zone once it turned out to be
 * the thing people actually liked.
 *
 * Reads its bounds from `dot.current.parentElement` rather than a ref passed
 * down from ScrollPanel. The passed-ref version silently never attached its
 * listeners — a ref populated by a PARENT component isn't guaranteed to be
 * set by the time a CHILD's own effect runs, and no error surfaces when it
 * isn't; the effect just closes over `null` and does nothing. Reading the
 * DOM directly off this component's own ref has no such race: by the time
 * this effect runs, `dot.current` is guaranteed set, and its parentElement is
 * simply whatever section rendered it.
 *
 * Desktop-only: `HOVER_OK` requires a fine pointer, so touch never sees a
 * circle it can't move independently of a tap.
 */
export function ZoneCursor() {
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
