import Link from "next/link";
import type { WorkTileItem } from "@/lib/work";
import { Tag } from "./ui";
import { WorkStill } from "./work-still";
import { WorkMeta } from "./work-meta";

/**
 * The `/work` index as a uniform grid — the second of the two views the page
 * offers, and the one a visitor who just wants to see everything at once
 * reaches for. `WorkLedger` is the default; see components/work-views.tsx.
 *
 * Every tile is the same size. There is no wide "feature" slot: the page used
 * to hand the full width to the first project whenever the count happened to
 * be odd, which is arithmetic standing in for editorial judgement — it made
 * VeloCult twice the size of TheChistka because there were five entries that
 * week. Nothing here is featured, so nothing here is bigger.
 *
 * No summary sentence either. A one-line description under each picture is a
 * worse version of the opening paragraph on the case page, and four stacked
 * blocks of caption is what made the old tile 735px tall. The tile carries
 * the four things a visitor scans on an index — when, who, what kind, what it
 * looks like — and the sentence lives one click away.
 */
function Tile({ item }: { item: WorkTileItem }) {
  return (
    <Link
      href={`/work/${item.slug}`}
      className="reveal group flex h-full flex-col"
    >
      <WorkStill slug={item.slug} image={item.image} size="tile" />

      <WorkMeta item={item} className="mt-5" />

      {/* Three lines and no reserved min-height. Two clamped lines cut real
          words off half the titles, and with no summary the title IS the
          description. Levelling is the grid's job instead: the cell
          stretches, `h-full` fills it, and `mt-auto` on the tag drops every
          tag in a row to the same baseline whatever the title did. */}
      <h2 className="font-display mt-3 line-clamp-3 text-heading-sm group-hover:underline underline-offset-[6px]">
        {item.title}
      </h2>

      <div className="mt-auto pt-5">
        {item.type ? <Tag>{item.type}</Tag> : null}
      </div>
    </Link>
  );
}

export function WorkSheet({ tiles }: { tiles: WorkTileItem[] }) {
  return (
    /* Row gap stays much larger than the column gap: a caption sits directly
       under its own picture, and with equal gaps the tile below reads as part
       of the caption above it. */
    <div className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
      {tiles.map((item) => (
        <Tile key={item.slug} item={item} />
      ))}
    </div>
  );
}
