import { useEffect, type RefObject } from "react";

/**
 * Mouse-drag horizontal scroll for a track that already supports native touch
 * scrolling and trackpad/wheel scroll — this only adds the missing case,
 * click-and-drag with a mouse.
 *
 * Guarded to `pointerType === "mouse"`: touch pointers also fire pointerdown/
 * move/up, and driving scrollLeft manually for those would fight the
 * browser's own momentum scrolling instead of leaving it alone.
 *
 * Cards ARE links in some tracks (Services), so drag-start deliberately does
 * NOT bail when the pointer comes down on an `<a>` — excluding anchors here
 * was tried first and broke dragging almost entirely, since a card being one
 * big link meant nearly every pointerdown landed on it. The distinction
 * between "click the card" and "drag the track" is made afterwards, by
 * movement distance: a drag that actually moved the track swallows the click
 * that follows it (so releasing over a card doesn't also navigate); a press
 * that never moved lets the click through normally. `preventDefault` on
 * pointerdown stops the browser's native "drag this link" ghost-image
 * gesture, which would otherwise fight the custom drag.
 */
export function useDragScroll(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let dragging = false;
    let startX = 0;
    let startScroll = 0;
    let moved = false;

    const swallowClick = (e: MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
    };

    const down = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      dragging = true;
      moved = false;
      startX = e.clientX;
      startScroll = el.scrollLeft;
      el.setPointerCapture(e.pointerId);
      el.style.cursor = "grabbing";
      el.style.scrollSnapType = "none";
      e.preventDefault();
    };

    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      el.scrollLeft = startScroll - dx;
    };

    const up = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      el.style.cursor = "";
      el.style.scrollSnapType = "";
      if (moved) {
        el.addEventListener("click", swallowClick, { capture: true, once: true });
      }
      el.releasePointerCapture?.(e.pointerId);
    };

    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.removeEventListener("click", swallowClick, true);
    };
  }, [ref]);
}
