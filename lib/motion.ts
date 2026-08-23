/**
 * Shared motion vocabulary.
 *
 * Deliberately imports NOTHING — no GSAP, no plugins. Server components import
 * from here too, and any GSAP import would drag the whole plugin set into every
 * client chunk that touches a constant.
 */

/**
 * GSAP advances tweens on requestAnimationFrame, which browsers do not fire in
 * a background tab. An entrance animation started there would apply its hidden
 * "from" state and then sit frozen — a blank page for anyone who opened the
 * site in a background tab, and for rAF-throttled crawlers.
 *
 * So: only animate when the document is actually being looked at. When it
 * isn't, callers skip the tween entirely and the natural (final) layout stands.
 */
export function isDocumentVisible() {
  return typeof document !== "undefined" && document.visibilityState !== "hidden";
}

/** Entrance/scroll animation is allowed. */
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";

/**
 * Hover effects are allowed. `(hover: hover)` matters: without it a touch tap
 * fires `pointerenter` and a hover state sticks on until the next tap elsewhere.
 */
export const HOVER_OK =
  "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

/**
 * One reveal signature for the whole site. Before this the page had three
 * different ones (0.75s/power2, 1s/default, 0.9s/power3), which is what read as
 * inconsistent when scrolling.
 */
export const REVEAL = {
  duration: 0.8,
  ease: "power3.out",
  y: 24,
  stagger: 0.08,
  start: "top 86%",
} as const;

/**
 * How far the dark panel's background hangs below its own section, so the light
 * panel that follows has something other than canvas to arrive over. Shared
 * because ScrollPanel's nav-tone trigger must end this much later than the
 * section does — otherwise the nav flips to light while still over black.
 */
export const PANEL_OVERHANG_VH = 0.38;
