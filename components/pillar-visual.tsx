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
      <rect className="p-block" x="24" y="146" width="172" height="46" rx="10" fill={ASH} />
      <rect className="p-block" x="24" y="92" width="172" height="46" rx="10" fill={PAPER} />
      <rect className="p-block" x="24" y="38" width="172" height="46" rx="10" fill={VOLT} />
    </>
  );
}

function Grow() {
  return (
    <>
      <polyline
        className="p-rail"
        points="30,186 82,150 126,94 188,34"
        fill="none"
        stroke={PAPER}
        strokeWidth="16"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle className="p-head" cx="188" cy="34" r="18" fill={VOLT} />
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
