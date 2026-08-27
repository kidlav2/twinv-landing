"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { HOVER_OK } from "@/lib/motion";

gsap.registerPlugin(useGSAP);

/**
 * A circle that follows the pointer inside its parent section and inverts
 * whatever it sits over via `mix-blend-mode: difference`.
 *
 * Off until a left click on the black itself. A second click turns it off.
 * Clicks on controls (links, buttons, fields) never toggle it — those are
 * for the page, not for the party trick.
 *
 * Desktop-only: `HOVER_OK` requires a fine pointer, so touch never sees a
 * circle it can't move independently of a tap.
 *
 * Bounds come from `dot.current.parentElement` rather than a ref passed
 * down from ScrollPanel — a parent-populated ref is not guaranteed set
 * when this child's effect runs.
 */
export function ZoneCursor() {
  const dot = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const el = dot.current;
    const section = el?.parentElement;
    if (!el || !section) return;

    const mm = gsap.matchMedia();

    mm.add(HOVER_OK, () => {
      let armed = false;
      const moveX = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" });
      const moveY = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" });

      const pos = (e: PointerEvent) => {
        const r = section.getBoundingClientRect();
        return { x: e.clientX - r.left, y: e.clientY - r.top };
      };

      const CONTROL =
        "a, button, input, textarea, select, label, summary, [role='button'], [role='link']";

      const isControl = (e: PointerEvent) =>
        e.composedPath().some(
          (n) => n instanceof Element && n.matches(CONTROL),
        );

      const stillInside = (e: PointerEvent) => {
        const next = e.relatedTarget;
        if (next instanceof Node && section.contains(next)) return true;
        return document
          .elementsFromPoint(e.clientX, e.clientY)
          .some((n) => n === section || section.contains(n));
      };

      const move = (e: PointerEvent) => {
        if (!armed) return;
        const { x, y } = pos(e);
        moveX(x);
        moveY(y);
      };
      const enter = () => {
        if (!armed) return;
        gsap.to(el, { scale: 1, duration: 0.25 });
      };
      const leave = (e: PointerEvent) => {
        // Clicking a link/button inside the zone can fire pointerleave with
        // a relatedTarget outside (the next <section>, or null). If the
        // pointer is still over this zone, keep the circle — only a click
        // on the black itself should toggle it off.
        if (stillInside(e)) return;
        gsap.to(el, { scale: 0, duration: 0.25 });
      };

      const down = (e: PointerEvent) => {
        if (e.button !== 0 || isControl(e)) return;
        const { x, y } = pos(e);
        if (armed) {
          armed = false;
          gsap.to(el, { scale: 0, duration: 0.25 });
          return;
        }
        armed = true;
        gsap.set(el, { x, y });
        gsap.to(el, { scale: 1, duration: 0.25 });
      };

      section.addEventListener("pointerdown", down);
      section.addEventListener("pointermove", move);
      section.addEventListener("pointerenter", enter);
      section.addEventListener("pointerleave", leave);

      return () => {
        section.removeEventListener("pointerdown", down);
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
