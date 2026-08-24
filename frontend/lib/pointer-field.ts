import gsap from "gsap";

/**
 * Makes a set of elements lean toward the pointer, each by its own depth.
 *
 * Client-only — it imports GSAP, so unlike `lib/motion.ts` this must never be
 * pulled into a server component.
 *
 * Listening on `window` rather than on the container is the whole trick for
 * touch. A finger dragging across a phone screen is a scroll, so the element
 * never receives the enter/leave pair a mouse would give it; a window-level
 * `pointermove` sees that drag and the shapes answer it. It is also nicer with
 * a mouse — the composition starts reacting slightly before the cursor is
 * over it, which is what makes it feel attached to the room rather than to a
 * hit box. `passive` because this never calls preventDefault: taking over the
 * touch stream here would break scrolling outright.
 *
 * Offsets are written with `quickTo`, which reuses one tween per property
 * instead of allocating on every move, and they animate `x`/`y` only. Anything
 * that also animates a target's transform (an entrance tween, say) has to be
 * finished before this starts, or the two fight over the same matrix.
 */
export type PointerTarget = { el: Element; depth: number };

export function pointerField(
  root: HTMLElement,
  targets: PointerTarget[],
  { max = 26, duration = 0.9 } = {},
) {
  const setters = targets.map((t) => ({
    depth: t.depth,
    x: gsap.quickTo(t.el, "x", { duration, ease: "power3.out" }),
    y: gsap.quickTo(t.el, "y", { duration, ease: "power3.out" }),
  }));

  const apply = (nx: number, ny: number) =>
    setters.forEach((s) => {
      s.x(nx * max * s.depth);
      s.y(ny * max * s.depth);
    });

  const onMove = (e: PointerEvent) => {
    const b = root.getBoundingClientRect();
    if (!b.width || !b.height) return;
    // −1…1 from the centre, clamped so a pointer on the far side of the page
    // parks the shapes at full lean instead of flinging them off.
    const nx = gsap.utils.clamp(
      -1,
      1,
      ((e.clientX - b.left) / b.width) * 2 - 1,
    );
    const ny = gsap.utils.clamp(
      -1,
      1,
      ((e.clientY - b.top) / b.height) * 2 - 1,
    );
    apply(nx, ny);
  };

  const reset = () => apply(0, 0);

  window.addEventListener("pointermove", onMove, { passive: true });
  // A finger lifting has no "leave", so settle back on release too.
  window.addEventListener("pointercancel", reset);
  window.addEventListener("pointerup", reset);

  return () => {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointercancel", reset);
    window.removeEventListener("pointerup", reset);
    reset();
  };
}
