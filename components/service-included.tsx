"use client";

import { useRef, useState, type KeyboardEvent } from "react";

export type IncludedItem = { label: string; body: string };

/**
 * The deliverables as an index and a detail pane, not a list of sentences.
 *
 * The problem this solves is scannability: five full sentences at equal
 * weight give the eye no entry point, so the section reads as a wall and gets
 * skipped. Here the resting state is five short labels — the detail arrives
 * for whichever one you point at. It also echoes the hero's left/right split,
 * so the page reads as one layout rather than three unrelated blocks.
 *
 * Every body stays in the DOM (hidden panels are opacity-0, not unmounted),
 * so a crawler still sees the full text on a page that exists to be found in
 * search.
 *
 * Panels are grid-stacked into ONE cell rather than swapped: the container is
 * then as tall as the longest body and the page does not jump when the active
 * item changes.
 */
export function ServiceIncluded({ items }: { items: IncludedItem[] }) {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  /** Roving focus. Without this only the selected tab is tabbable and the
   *  rest are unreachable by keyboard — the standard tablist trade. */
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const last = items.length - 1;
    let next: number | null = null;

    if (e.key === "ArrowDown" || e.key === "ArrowRight")
      next = active === last ? 0 : active + 1;
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft")
      next = active === 0 ? last : active - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;

    if (next === null) return;
    e.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-10">
      <div
        role="tablist"
        aria-orientation="vertical"
        aria-label="What's included"
        onKeyDown={onKeyDown}
        className="border-line-strong flex flex-col border-b lg:col-span-5"
      >
        {items.map((item, i) => {
          const on = i === active;
          return (
            <button
              key={item.label}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`included-tab-${i}`}
              aria-selected={on}
              aria-controls={`included-panel-${i}`}
              tabIndex={on ? 0 : -1}
              // Pointer, focus and click all select. A touch tap firing
              // pointerenter is fine here — the thing it "sticks" is the
              // selection, which is what a tap is asking for anyway.
              onPointerEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              className="border-line-strong flex items-center gap-4 border-t py-5 text-left"
            >
              {/* Voltage as a micro-accent, which is the only role the system
                  allows it — it marks the active row and nothing else. */}
              <span
                aria-hidden
                className={`size-2.5 shrink-0 transition-colors duration-200 ${
                  on ? "bg-voltage" : "bg-transparent"
                }`}
              />
              <span
                className={`font-display text-heading-sm transition-colors duration-200 ${
                  on ? "text-fg" : "text-faint"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid lg:col-span-6 lg:col-start-7">
        {items.map((item, i) => (
          <p
            key={item.label}
            id={`included-panel-${i}`}
            role="tabpanel"
            aria-labelledby={`included-tab-${i}`}
            aria-hidden={i !== active}
            className={`text-fg col-start-1 row-start-1 max-w-[46ch] text-lead transition-opacity duration-300 ${
              i === active ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            {item.body}
          </p>
        ))}
      </div>
    </div>
  );
}
