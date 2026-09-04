import type { WorkCase, WorkTileItem } from "@/lib/work";

/**
 * "Self-initiated · 2026" or "Logistics · 2026 · VeloCult" — the line that
 * opens every entry on the index, in both views.
 *
 * Self-initiated work leads with that fact rather than with its sector, for
 * the reason documented on `kind` in lib/content.ts: "we built this
 * ourselves" is the honest frame, and a visitor who works it out later stops
 * believing the rest of the page.
 *
 * The client name keeps its voltage highlight. It was briefly dropped when
 * this line was a plain string, on the argument that the index sets the meta
 * in one run of mono type — which was a convenience talking, not a reason.
 * The highlight is the only saturated thing in an otherwise grey line, and it
 * is marking the one fact on the index a prospective client is actually
 * scanning for: whose work this was. Same treatment as the teaser card's
 * `Kicker` in work-card.tsx, so the two read as one system.
 */
export function WorkMeta({
  item,
  className = "",
}: {
  item: WorkTileItem | WorkCase;
  className?: string;
}) {
  const lead = item.kind === "self" ? "Self-initiated" : item.sector;

  return (
    <p className={`text-faint font-mono text-caption uppercase ${className}`}>
      {[lead, item.year].filter(Boolean).join(" · ")}
      {item.client ? (
        <>
          {" · "}
          <span className="bg-voltage text-carbon px-1">{item.client}</span>
        </>
      ) : null}
    </p>
  );
}
