/**
 * Blob path generation. Pure and deterministic — no GSAP, no DOM — so the
 * server and the client produce byte-identical `d` strings and React never
 * complains about a hydration mismatch.
 *
 * Why generate rather than hand-draw: every shape built here has the SAME point
 * count, the same winding, and the same start point by construction. That is
 * precisely what MorphSVG needs to interpolate cleanly — hand-authored blobs
 * usually differ in one of the three, which is what produces the sudden "flip"
 * mid-morph that makes the plugin look broken.
 */

/**
 * A closed smooth curve through N points placed evenly around a circle, each
 * pushed out to `base * radii[i]`. Uses Catmull-Rom → cubic Bézier conversion.
 *
 * @param radii  one multiplier per point; its length IS the point count
 * @param cx,cy  centre in user units
 * @param base   radius at multiplier 1
 */
export function blobPath(
  radii: readonly number[],
  cx: number,
  cy: number,
  base: number,
): string {
  const n = radii.length;
  const pts = radii.map((r, i) => {
    // Start at 12 o'clock so every variant's first point is in the same place.
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return [cx + Math.cos(a) * base * r, cy + Math.sin(a) * base * r] as const;
  });

  const f = (v: number) => v.toFixed(2);
  let d = `M${f(pts[0][0])},${f(pts[0][1])}`;

  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += `C${f(c1x)},${f(c1y)} ${f(c2x)},${f(c2y)} ${f(p2[0])},${f(p2[1])}`;
  }

  return `${d}Z`;
}

/**
 * Deterministic radii for one blob variant.
 *
 * The hero's five blobs carry their sequences by hand, which is fine for five.
 * The service pages need six distinct arrangements of five blobs at three
 * shapes each — ninety hand-written arrays, every one a chance to typo a
 * number and get a shape that spikes outside its viewBox. Seeding them keeps
 * the same guarantees for free: same seed, same numbers, on the server and on
 * the client, so the inline `d` never trips a hydration mismatch.
 *
 * Range 0.74–1.28 matches the hand-authored set. A narrower swing reads as a
 * rounded octagon rather than a drop, and the upper bound is what keeps a
 * blob inside `base * 1.3` — the figure every layout below is measured
 * against.
 */
export function blobRadii(seed: number, count = 8): number[] {
  // mulberry32 — small, fast, and stable across engines, which matters more
  // here than statistical quality.
  let s = seed >>> 0;
  const rand = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    // Rounded to match blobPath's own 2-decimal output — no point carrying
    // precision the path string throws away.
    out.push(Number((0.74 + rand() * 0.54).toFixed(2)));
  }
  return out;
}
