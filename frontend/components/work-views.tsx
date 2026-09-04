"use client";

import { useSyncExternalStore } from "react";
import type { WorkTileItem } from "@/lib/work";
import { WorkLedger } from "./work-ledger";
import { WorkSheet } from "./work-sheet";

/**
 * The `/work` index has two views of the same list, and this is the switch.
 *
 * Ledger is the default because it is the studio's own reading of the work —
 * one project at a time, at size, in the order we would walk someone through
 * them. Sheet exists because that is not what everybody came for: a visitor
 * comparing studios wants all of it on one screen, and making them scroll a
 * narrated list to get there is a worse experience dressed as a better one.
 *
 * Two views, not three. The switch has to stay readable at a glance, and a
 * third option would turn a binary into a menu.
 */
const KEY = "twinv:work-view";
type View = "ledger" | "sheet";

/**
 * The remembered choice, held in a tiny external store rather than in an
 * effect that calls `setState`.
 *
 * The constraint is hydration: the server has no `localStorage`, so it always
 * renders Ledger, and a client that read storage during render would produce
 * different markup on a return visit. `useSyncExternalStore` is built for
 * exactly this — it takes a separate server snapshot, hydrates against that,
 * and re-renders with the real value immediately afterwards. Reading it in an
 * effect instead works too, but it is a setState in an effect body, which is
 * the cascading-render pattern React now warns about.
 *
 * `cached` is module-level because `getSnapshot` must return a stable value:
 * hitting `localStorage` on every call would be a fresh read on every render.
 */
let cached: View | null = null;
const listeners = new Set<() => void>();

function readStored(): View {
  try {
    return localStorage.getItem(KEY) === "sheet" ? "sheet" : "ledger";
  } catch {
    /* Private mode, or storage switched off. The default is a fine page. */
    return "ledger";
  }
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function getSnapshot(): View {
  if (cached === null) cached = readStored();
  return cached;
}

function store(next: View) {
  cached = next;
  try {
    localStorage.setItem(KEY, next);
  } catch {
    /* Nothing to recover from — the view still changed for this visit. */
  }
  listeners.forEach((fn) => fn());
}

const VIEWS: { id: View; label: string }[] = [
  { id: "ledger", label: "One by one" },
  { id: "sheet", label: "All at once" },
];

export function WorkViews({ tiles }: { tiles: WorkTileItem[] }) {
  const view = useSyncExternalStore(subscribe, getSnapshot, () => "ledger");

  return (
    <>
      {/* `role="tablist"` and not a pair of buttons in a div: these two
          control which of two panels is showing, which is what a tab is.
          Sits right-aligned against the masthead's own baseline. */}
      <div
        role="tablist"
        aria-label="Layout"
        className="border-line-strong mb-10 flex justify-end gap-1 border-b pb-4"
      >
        {VIEWS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={view === id}
            onClick={() => store(id)}
            className={`rounded-tag px-4 py-2 font-mono text-caption uppercase transition-colors ${
              view === id
                ? "bg-carbon text-paper"
                : "text-faint hover:text-fg hover:bg-paper"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {view === "ledger" ? (
        <WorkLedger tiles={tiles} />
      ) : (
        <WorkSheet tiles={tiles} />
      )}
    </>
  );
}
