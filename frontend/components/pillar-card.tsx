"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { useGSAP } from "@gsap/react";
import { isDocumentVisible, HOVER_OK, MOTION_OK } from "@/lib/motion";
import { PillarVisual, DESIGN_REST, type PillarVariant } from "./pillar-visual";

gsap.registerPlugin(useGSAP, ScrollTrigger, MorphSVGPlugin);

/**
 * Morph targets for the `design` variant — square → circle → blob → square.
 * The final entry MUST equal `DESIGN_REST` in pillar-visual.tsx, or the loop
 * snaps on its way back round to the authored resting shape.
 */
const DESIGN_SHAPES = [
  "M110,20 C160,20 200,60 200,110 C200,160 160,200 110,200 C60,200 20,160 20,110 C20,60 60,20 110,20 Z",
  "M114,24 C166,20 200,66 194,116 C188,166 144,202 96,194 C48,186 20,140 26,90 C32,40 62,28 114,24 Z",
  DESIGN_REST,
];

/**
 * One pillar. The whole card is the link — there is no separate "More details"
 * affordance any more.
 *
 * The visual's wrapper matches the SVG's box and is centred. That matters:
 * previously the wrapper was `w-full` (~380px) while the SVG was
 * `max-w-[190px]` and left-aligned, so a CSS `scale-110` scaled about the
 * *wrapper's* centre — ~95px right of the art's own centre — and the art
 * visibly slid left instead of growing in place.
 *
 * GSAP owns the transform outright. Tailwind v4 compiles `scale-*` to the
 * standalone `scale:` property while GSAP writes `transform: scale()`; running
 * both would multiply them. Rest size is therefore a layout width, not a
 * rest-scale — otherwise the 260px box would still be the hover target
 * around a visually smaller drawing.
 *
 * Authored drawing was 260px. Rest is 1.5× smaller, so hover can grow the
 * icon 1.5× back to authored size without eating the neighbours. 2× did.
 * Listener is on the SVG, not the article: the title and body are not the icon.
 */
const ART_REST_PX = 260 / 1.5;
const ART_HOVER = 1.5;
export function PillarCard({
  title,
  body,
  href,
  variant,
}: {
  title: string;
  body: string;
  href: string;
  variant: PillarVariant;
}) {
  const scope = useRef<HTMLElement>(null);
  const art = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.set(art.current, {
        scale: 1,
        transformOrigin: "50% 50%",
      });

      const mm = gsap.matchMedia();

      mm.add({ motion: MOTION_OK, hover: HOVER_OK }, (ctx) => {
        const { motion, hover: canHover } = ctx.conditions as {
          motion: boolean;
          hover: boolean;
        };
        if (!motion) return;
        if (!isDocumentVisible()) return;

        const loop = gsap.timeline({
          repeat: -1,
          repeatDelay: 0.5,
          paused: true,
        });

        if (variant === "design") {
          const target = scope.current?.querySelector(".p-morph");
          const dot = scope.current?.querySelector(".p-dot");
          if (target) {
            DESIGN_SHAPES.forEach((shape) => {
              loop.to(target, {
                morphSVG: { shape, type: "rotational", origin: "50% 50%" },
                duration: 1.5,
                ease: "sine.inOut",
              });
            });
          }
          if (dot) {
            // A breathing pulse in place, not an orbit: orbiting the dot
            // around the box centre put it up to ~116 units out from a centre
            // at (110,110) — past the 0–220 viewBox on every side, so the SVG's
            // default overflow:hidden clipped it away for most of the cycle.
            // That's the "some of these aren't even visible" bug. Scaling in
            // place carries the same "still alive while the shape works" idea
            // with zero risk of leaving the box.
            loop.to(
              dot,
              {
                scale: 1.6,
                transformOrigin: "50% 50%",
                svgOrigin: "192 28",
                duration: 0.75,
                ease: "sine.inOut",
                yoyo: true,
                repeat: 5,
              },
              0,
            );
          }
        }

        if (variant === "build") {
          const blocks = gsap.utils.toArray<SVGElement>(".p-block");
          loop
            .from(blocks, {
              y: -170,
              opacity: 0,
              // Was 0.5s/stagger 0.16 — read as flashing. Slower drop, more
              // space between blocks landing, longer hold before it repeats.
              duration: 0.85,
              ease: "power2.out",
              stagger: 0.3,
            })
            .to(blocks, { duration: 1.6 });
        }

        if (variant === "grow") {
          const bars = gsap.utils.toArray<SVGElement>(".p-bar");
          // Read each bar's own resting attributes as the tween's targets,
          // rather than hard-coding them a second time here.
          const rest = bars.map((b) => ({
            y: parseFloat(b.getAttribute("y") ?? "0"),
            height: parseFloat(b.getAttribute("height") ?? "0"),
          }));
          if (bars.length) {
            loop
              .fromTo(
                bars,
                { attr: { y: 190, height: 0 } },
                {
                  attr: {
                    y: (i: number) => rest[i].y,
                    height: (i: number) => rest[i].height,
                  },
                  duration: 0.7,
                  ease: "power2.out",
                  stagger: 0.16,
                },
              )
              .to(bars, { duration: 1.2 });
          }
        }

        // Don't burn rAF on a loop nobody can see.
        ScrollTrigger.create({
          trigger: scope.current,
          start: "top bottom",
          end: "bottom top",
          onToggle: ({ isActive }) => (isActive ? loop.play() : loop.pause()),
        });

        const drawing = art.current?.querySelector(".p-art");
        let hover: gsap.core.Timeline | undefined;
        const enter = () => hover?.play();
        const leave = () => hover?.reverse();

        if (canHover && drawing) {
          // A paused timeline played/reversed — not two gsap.to calls, which
          // stutter when the pointer enters and leaves quickly. Listener is
          // on the SVG, not the article: the title and body are not the icon.
          hover = gsap
            .timeline({ paused: true })
            .to(
              art.current,
              {
                scale: ART_HOVER,
                duration: 0.35,
                ease: "power2.out",
                transformOrigin: "50% 50%",
              },
              0,
            )
            .to(loop, { timeScale: 1.8, duration: 0.4 }, 0);

          drawing.addEventListener("pointerenter", enter);
          drawing.addEventListener("pointerleave", leave);
        }

        return () => {
          drawing?.removeEventListener("pointerenter", enter);
          drawing?.removeEventListener("pointerleave", leave);
          loop.kill();
        };
      });

      return () => mm.revert();
    },
    { scope, dependencies: [variant] },
  );

  return (
    <article
      ref={scope}
      className="reveal flex flex-col items-center text-center"
    >
      <Link
        href={href}
        aria-label={title}
        className="pillar-link flex flex-col items-center rounded-card-sm px-2 py-2"
      >
        <div
          className="flex max-w-full justify-center overflow-visible"
          style={{ width: ART_REST_PX }}
        >
          <div ref={art} className="relative z-10 w-full">
            <PillarVisual variant={variant} />
          </div>
        </div>

        <h3 className="pillar-title font-display mt-10 text-heading">
          {title}
        </h3>
      </Link>

      <p className="text-muted mt-4 max-w-[34ch] text-pretty text-body leading-[1.45]">{body}</p>
    </article>
  );
}
