"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { hero } from "@/lib/content";
import { isDocumentVisible } from "@/lib/motion";
import { HeroBlobs } from "./hero-blobs";

gsap.registerPlugin(useGSAP);

export function Hero() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (!isDocumentVisible()) return;

        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
          delay: 0.15,
        });

        tl.from(".hero-line span", {
          yPercent: 115,
          duration: 0.9,
          stagger: 0.09,
        }).from(".hero-sub", { opacity: 0, y: 20, duration: 0.7 }, "-=0.5");
      });

      return () => mm.revert();
    },
    { scope },
  );

  return (
    <section
      ref={scope}
      id="top"
      className="pb-section pt-[calc(var(--spacing-nav)+24px)]"
    >
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-10">
          {/* Text column: headline directly followed by sub-copy, so the
              first line of body text is on-screen without scrolling. */}
          {/* `@container` so the headline tracks THIS column, not the
              viewport. `text-display-xl` is 12.5vw of the window — on a
              13" Air that is still ~160px, poured into half the grid, which
              is how "Built to convert." became five lines. 18.5% of the
              column hits the same 168px ceiling on a 27" (so that
              composition does not move) and drops to ~108px in the Air's
              half-width column, which is what lets each phrase sit on one
              line. Floor is the token's 3.75rem: display type does not go
              below 48px. */}
          <div className="@container flex flex-col lg:pt-6">
            <h1 className="font-display text-display-xl [font-size:clamp(3.75rem,18.5cqi,10.5rem)]">
              {hero.headline.map((line) => (
                <span
                  key={line}
                  className="hero-line block overflow-hidden pb-1"
                >
                  <span className="block">{line}</span>
                </span>
              ))}
            </h1>

            <div className="mt-8 max-w-[46ch] lg:mt-20">
              <p className="hero-sub text-muted text-sub-lg leading-[1.35]">
                {hero.sub}
              </p>
            </div>
          </div>

          {/* Object column — runs alongside the whole text column */}
          <div className="lg:-mt-4 lg:pl-6">
            <HeroBlobs />
          </div>
        </div>
      </div>
    </section>
  );
}
