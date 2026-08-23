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
