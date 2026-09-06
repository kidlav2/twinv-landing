"use client";

import { work } from "@/lib/content";
import { hostOf } from "@/lib/work";
import { usePhotoMat } from "./photo-mat";
import { WorkStill } from "./work-still";

type LiveItem = {
  slug: string;
  url: string;
  image: string;
};

/**
 * The case-study still as the live site, not as a picture of it.
 *
 * Not Mac traffic-lights: work-still already refused those, and wrapping
 * every case in the same device chrome would make the work interchangeable.
 * The strip is the destination — hostname in mono, mint because mint is the
 * link colour — so a tap on a phone has somewhere labeled to land, and a
 * hover is only confirmation. The whole frame is the link; WorkStill stays
 * `aria-hidden` so the drawing inside does not also enter the tree.
 *
 * The bar (and the contain mat under it) take the photo's own ground, so a
 * white site or a black dashboard is not sitting in a carbon hole. Mint
 * stays on dark chrome only; on a light ground it fails contrast, and the
 * host drops to carbon — the frame is already the link.
 */
export function WorkLive({
  item,
  className = "",
  reveal = true,
}: {
  item: LiveItem;
  className?: string;
  /** Hub stage already owns entrance; a nested `.reveal` would pre-hide
   *  the still and freeze it if the swap remounts off the original batch. */
  reveal?: boolean;
}) {
  const host = hostOf(item.url);
  const mat = usePhotoMat(item.image);

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      aria-label={`${work.visit} ${host}`}
      className={`${reveal ? "reveal " : ""}group block max-lg:-mx-[var(--shell-padding)] max-lg:w-[calc(100%+var(--shell-padding)*2)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current ${className}`}
    >
      <div
        className={`rounded-card max-lg:rounded-none overflow-hidden ${
          mat ? "" : "bg-carbon"
        }`}
        style={mat ? { backgroundColor: mat.hex } : undefined}
      >
        <div className="flex min-h-11 items-center justify-between gap-4 px-4 py-3 sm:px-5">
          <span
            className={`${
              mat?.light ? "text-carbon" : "text-mint"
            } font-mono text-caption truncate`}
          >
            {host}
          </span>
          <span
            aria-hidden
            className={mat?.light ? "text-muted" : "text-paper/45"}
          >
            ↗
          </span>
        </div>
        <WorkStill
          slug={item.slug}
          image={item.image}
          size="hero"
          bleed={false}
          fit="contain"
          className="rounded-none"
        />
      </div>
    </a>
  );
}
