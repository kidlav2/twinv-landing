/**
 * Pure SVG markup for the three pillar visuals. No hooks, no server-only APIs —
 * it is imported by the client component `pillar-card.tsx` and compiles into the
 * client bundle. That is intentional; don't add "use client" here and don't
 * "fix" it back to a server-only import.
 *
 * Every shape carries a class (`.p-*`) so GSAP has something to target. The
 * static markup below IS the resting composition: with no JS, with reduced
 * motion, or in a background tab, this is what renders, and it looks finished.
 *
 * The shapes sit directly on the zone background — no backing tile, no frame.
 * A container here would read as a card, which this section deliberately isn't.
 */

export type PillarVariant = "design" | "build" | "grow";

const ASH = "#c6c6c6";
const PAPER = "#ffffff";
const MINT = "#d1ffca";
const VOLT = "#fff100";

/** The rest shape — a square. Morph targets live in `pillar-card.tsx`. */
export const DESIGN_REST = "M28,28 L192,28 L192,192 L28,192 Z";

function Design() {
  return (
    <>
      <path className="p-morph" d={DESIGN_REST} fill={PAPER} />
      <circle className="p-dot" cx="192" cy="28" r="17" fill={MINT} />
    </>
  );
}

function Build() {
  return (
    <>
      {/* Bottom-up: the loop drops these in from above and restacks. */}
      <rect
        className="p-block"
        x="24"
        y="146"
        width="172"
        height="46"
        rx="10"
        fill={ASH}
      />
      <rect
        className="p-block"
        x="24"
        y="92"
        width="172"
        height="46"
        rx="10"
        fill={PAPER}
      />
      <rect
        className="p-block"
        x="24"
        y="38"
        width="172"
        height="46"
        rx="10"
        fill={VOLT}
      />
    </>
  );
}

/** An actual bar chart — ascending bars off a baseline, tallest picked out in
 *  voltage. The previous version was a single curved line, which read as
 *  abstract doodle rather than "growth". Bar heights/positions here are the
 *  resting (tallest) state; pillar-card.tsx animates each up from the
 *  baseline using these same attribute values as its targets. */
function Grow() {
  return (
    <>
      <line
        x1="22"
        y1="190"
        x2="198"
        y2="190"
        stroke={ASH}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <rect
        className="p-bar"
        x="38"
        y="150"
        width="30"
        height="40"
        rx="5"
        fill={ASH}
      />
      <rect
        className="p-bar"
        x="82"
        y="118"
        width="30"
        height="72"
        rx="5"
        fill={ASH}
      />
      <rect
        className="p-bar"
        x="126"
        y="82"
        width="30"
        height="108"
        rx="5"
        fill={PAPER}
      />
      <rect
        className="p-bar"
        x="170"
        y="40"
        width="30"
        height="150"
        rx="5"
        fill={VOLT}
      />
    </>
  );
}

const VARIANTS: Record<PillarVariant, () => React.ReactElement> = {
  design: Design,
  build: Build,
  grow: Grow,
};

export function PillarVisual({ variant }: { variant: PillarVariant }) {
  const Shape = VARIANTS[variant];
  return (
    <svg viewBox="0 0 220 220" className="block h-auto w-full" aria-hidden>
      <Shape />
    </svg>
  );
}
