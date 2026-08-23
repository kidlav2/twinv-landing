"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { services } from "@/lib/content";
import { Reveal } from "./reveal";
import { useDragScroll } from "@/lib/use-drag-scroll";

function cardStep(track: HTMLDivElement) {
  const card = track.querySelector<HTMLElement>("[data-service-card]");
  return card ? card.offsetWidth + 24 : track.clientWidth;
}

/**
 * A drag-to-scroll carousel — the same mechanics as Cases (arrows, dots,
 * snap, mouse-drag), so the two carousels on the page behave like one system.
 * Cards are sized so ~4 fit on a normal desktop width at once: the earlier
 * version at 46vw only showed about 1.5 cards, which read as a slideshow of
 * giant slides rather than a scannable list of five services.
 */
export function Services() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [active, setActive] = useState(0);
  const [scrollable, setScrollable] = useState(false);

  useDragScroll(trackRef);

  const sync = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft >= el.scrollWidth - el.clientWidth - 4);
    setActive(Math.round(el.scrollLeft / cardStep(el)));
    setScrollable(el.scrollWidth - el.clientWidth > 4);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    sync();
    el.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      el.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [sync]);

  const scrollBy = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * cardStep(el), behavior: "smooth" });
  };

  const scrollToIndex = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: i * cardStep(el), behavior: "smooth" });
  };

  return (
    <section id="services" className="py-section">
      <Reveal>
        <div className="shell">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="reveal font-display text-heading-lg">
              {services.headline}
            </h2>
            <div className="reveal flex items-end justify-between gap-6 sm:justify-end">
              <p className="text-muted max-w-[32ch] text-sub">{services.sub}</p>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => scrollBy(-1)}
                  disabled={atStart}
                  aria-label="Previous service"
                  className="border-slate text-carbon hover:bg-carbon hover:text-paper flex h-12 w-12 items-center justify-center rounded-full border-[1.5px] transition-colors disabled:pointer-events-none disabled:opacity-30"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => scrollBy(1)}
                  disabled={atEnd}
                  aria-label="Next service"
                  className="border-slate text-carbon hover:bg-carbon hover:text-paper flex h-12 w-12 items-center justify-center rounded-full border-[1.5px] transition-colors disabled:pointer-events-none disabled:opacity-30"
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          ref={trackRef}
          className="mt-12 flex cursor-grab snap-x snap-mandatory gap-6 overflow-x-auto pb-4 select-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{
            paddingInlineStart: "var(--shell-padding)",
            paddingInlineEnd: "var(--shell-padding)",
          }}
        >
          {services.items.map((s) => (
            <a
              key={s.title}
              href="#contact"
              data-service-card
              className="group bg-paper rounded-card hover:bg-carbon flex w-[78vw] shrink-0 snap-start flex-col p-7 transition-colors duration-300 sm:w-[280px]"
            >
              <span className="text-faint group-hover:text-ash font-mono text-caption uppercase transition-colors">
                {s.meta}
              </span>
              <h3 className="font-display text-carbon group-hover:text-paper mt-4 text-heading-sm transition-colors">
                {s.title}
              </h3>
              <p className="text-muted group-hover:text-ash mt-3 flex-1 text-body-sm transition-colors">
                {s.body}
              </p>
              <span className="text-carbon group-hover:text-paper mt-6 flex items-center gap-2 font-mono text-caption uppercase transition-colors">
                Learn more
                <span
                  aria-hidden
                  className="transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
              </span>
            </a>
          ))}
        </div>

        {scrollable && services.items.length > 1 && (
          <div className="mt-8 flex justify-center gap-2" role="tablist">
            {services.items.map((s, i) => (
              <button
                key={s.title}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={`Go to service ${i + 1}`}
                onClick={() => scrollToIndex(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === active ? "bg-carbon w-6" : "bg-ash w-2"
                }`}
              />
            ))}
          </div>
        )}
      </Reveal>
    </section>
  );
}
