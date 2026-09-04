"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { isDocumentVisible, MOTION_OK, TIMELINE_PIN_OK } from "@/lib/motion";
import type { WorkTileItem } from "@/lib/work";
import { Tag } from "./ui";
import { WorkStill } from "./work-still";
import { WorkMeta } from "./work-meta";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * The `/work` index as one held picture and a list of titles — the page's
 * default view. `WorkSheet` is the other one; see components/work-views.tsx.
 *
 * Which project the frame shows has TWO inputs, and they are not the same
 * kind of thing:
 *
 *   scroll — the row crossing the middle of the window is the current one.
 *            This is what makes the page work when nobody touches the mouse:
 *            reading down the list changes the picture on its own, and it is
 *            the only input a touch device or a keyboard has.
 *   hover  — while the pointer is actually on a row, that row wins.
 *
 * Hover overriding scroll rather than replacing it is the point. Scroll alone
 * ignores a visitor who is deliberately pointing at the third project;
 * pointer alone leaves the frame stuck on whatever was hovered last, which is
 * usually the wrong project by the time you have scrolled past it. `hovered`
 * is therefore nullable state, not a copy of `current` — releasing the
 * pointer hands the frame straight back to the scroll position instead of
 * freezing it where the mouse happened to leave.
 */
export function WorkLedger({ tiles }: { tiles: WorkTileItem[] }) {
  const scope = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);

  const active = hovered ?? scrolled;
  const shown = tiles[active] ?? tiles[0];

  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;

      const rows = gsap.utils.toArray<HTMLElement>("[data-row]", root);
      const panel = root.querySelector<HTMLElement>("[data-panel]");

      const navPx =
        parseInt(
          getComputedStyle(document.documentElement).getPropertyValue(
            "--nav-height",
          ),
          10,
        ) || 113;

      const mm = gsap.matchMedia();

      /* Which row owns the middle of the window. Not inside MOTION_OK: this
         is not an animation, it is the page's selection state, and a visitor
         on reduced motion still scrolls. The rows are contiguous — they are
         stacked list items sharing hairlines — so exactly one of them
         contains the centre line at any moment, and the last value simply
         stands above the first row and below the last. */
      const marks = rows.map((row, i) =>
        ScrollTrigger.create({
          trigger: row,
          start: "top center",
          end: "bottom center",
          // Only ever set on entry. Clearing on exit would blank the frame in
          // the pixel between one row leaving the centre and the next
          // arriving.
          onToggle: ({ isActive }) => isActive && setScrolled(i),
        }),
      );

      mm.add(TIMELINE_PIN_OK, () => {
        const last = rows[rows.length - 1];
        if (!panel || !last) return;

        /* The bug this `endTrigger` fixes: the pin used to end at the grid's
           own `bottom bottom`, which is the moment the LIST's last pixel
           reaches the bottom of the window — the final project is still down
           in the corner, unread, and the picture has already let go and
           started scrolling away.
           Ending on the last row's own centre instead means the frame is held
           until the last project is the one being read, and only then does
           the whole column travel up into the closing panel together. */
        const st = ScrollTrigger.create({
          trigger: root,
          // +40 so the frame clears the bar rather than touching it.
          start: `top ${navPx + 40}px`,
          endTrigger: last,
          end: "center center",
          pin: panel,
          pinSpacing: false,
          invalidateOnRefresh: true,
        });

        return () => st.kill();
      });

      return () => {
        marks.forEach((m) => m.kill());
        mm.revert();
      };
    },
    { scope },
  );

  /* The frame cross-fades rather than cutting. Keyed on the slug so it fires
     on a change and not on every render, and guarded because it starts from
     opacity 0 — see the rule in AGENTS.md about what a `from` state does in a
     tab that never gets a frame. */
  useGSAP(
    () => {
      if (!isDocumentVisible()) return;
      const frame = scope.current?.querySelector("[data-frame]");
      if (!frame) return;

      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          frame,
          { opacity: 0 },
          { opacity: 1, duration: 0.35, ease: "power2.out" },
        );
      });
      return () => mm.revert();
    },
    { scope, dependencies: [shown.slug] },
  );

  return (
    <div ref={scope} className="lg:grid lg:grid-cols-12 lg:gap-12">
      {/* `aria-hidden`: every picture this panel can show is already reachable
          through the row that selects it, so to a screen reader the panel is
          a duplicate of the list below. */}
      <div className="hidden lg:col-span-5 lg:block" aria-hidden data-panel>
        <div data-frame>
          {/* 4:3, not the 3:2 the grid view uses. This is the only picture on
              the page, so it can afford the taller frame — and the height is
              what stops the held column reading as a small picture with a
              void under it. */}
          <WorkStill
            key={shown.slug}
            slug={shown.slug}
            image={shown.image}
            size="lg"
            bleed={false}
          />
          <WorkMeta item={shown} className="mt-5" />
        </div>
      </div>

      <ul className="lg:col-span-7">
        {tiles.map((item, i) => (
          <li
            key={item.slug}
            data-row
            className="border-line-strong border-t last:border-b"
          >
            <Link
              href={`/work/${item.slug}`}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(i)}
              onBlur={() => setHovered(null)}
              className="reveal group block py-8"
            >
              {/* Below `lg` the held panel does not exist — there is no hover
                  and no room for a second column — so each row carries its
                  own picture and the view becomes an ordinary list. */}
              <div className="mb-6 lg:hidden">
                <WorkStill slug={item.slug} image={item.image} size="tile" />
              </div>

              <WorkMeta item={item} />

              {/* The dimming is `lg:` only. On a phone every row is its own
                  card with its own picture, and greying three of the four
                  would just look like broken text. */}
              <h2
                className={`font-display mt-4 max-w-[20ch] text-heading transition-opacity duration-300 ${
                  i === active ? "opacity-100" : "lg:opacity-40"
                }`}
              >
                {item.title}
              </h2>

              <div className="mt-5">
                {item.type ? <Tag>{item.type}</Tag> : null}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
