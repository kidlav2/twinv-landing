"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { useGSAP } from "@gsap/react";
import { MOTION_OK } from "@/lib/motion";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother);

/** Read the nav height from the design token rather than duplicating it. */
function navOffset() {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(
    "--nav-height",
  );
  return parseInt(raw, 10) || 113;
}

/**
 * Wraps the scrolling content in ScrollSmoother's required
 * `#smooth-wrapper > #smooth-content` pair.
 *
 * `<Nav />` MUST stay outside this component. ScrollSmoother makes the wrapper
 * `position: fixed; overflow: hidden` and applies a transform to the content —
 * and a transformed ancestor becomes the containing block for `position: fixed`
 * descendants, so a nav rendered inside would scroll away with the page instead
 * of staying pinned to the viewport.
 *
 * Children stay server components; passing RSC children through a client
 * component is fine.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const wrapper = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add(MOTION_OK, () => {
      // StrictMode double-mounts in dev and only one instance may exist.
      ScrollSmoother.get()?.kill();

      const smoother = ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        // 1.0, not the 2.0 you see in demos — scroll smoothing is scroll
        // hijacking, and anything slower reads as sluggish on a trackpad.
        smooth: 1,
        smoothTouch: false,
        ignoreMobileResize: true,
        effects: false,
      });

      // Child effects run before parent effects, so the ScrollTriggers in
      // ScrollPanel/Reveal were created before the smoother existed. create()
      // refreshes internally; this is the belt to that braces.
      const raf = requestAnimationFrame(() => ScrollTrigger.refresh());

      /**
       * One delegated capture-phase listener instead of rewriting every anchor.
       *
       * Capture on `document` fires before React's delegated bubble-phase
       * dispatch, so preventDefault lands first. next/link checks
       * `defaultPrevented` only AFTER invoking the element's own onClick, so
       * the mobile menu's `setOpen(false)` still runs. Never stopPropagation
       * here — that is exactly what would break those handlers.
       */
      const onClick = (e: MouseEvent) => {
        if (
          e.defaultPrevented ||
          e.button !== 0 ||
          e.metaKey ||
          e.ctrlKey ||
          e.shiftKey ||
          e.altKey
        ) {
          return;
        }
        const a = (e.target as Element | null)?.closest?.("a");
        const href = a?.getAttribute("href");
        if (!href || href.length < 2 || href[0] !== "#") return;
        // getElementById sidesteps CSS.escape concerns with odd ids.
        const target = document.getElementById(href.slice(1));
        if (!target) return;
        e.preventDefault();
        smoother.scrollTo(target, true, `top ${navOffset()}px`);
        history.pushState(null, "", href);
      };

      document.addEventListener("click", onClick, true);

      return () => {
        cancelAnimationFrame(raf);
        document.removeEventListener("click", onClick, true);
        // useGSAP reverts tweens and triggers, but not the smoother instance.
        smoother.kill();
      };
    });

    return () => mm.revert();
  }, {});

  return (
    <div id="smooth-wrapper" ref={wrapper}>
      <div id="smooth-content">{children}</div>
    </div>
  );
}
