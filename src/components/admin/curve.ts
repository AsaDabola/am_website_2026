/**
 * A rounded path through a series of points.
 *
 * Catmull-Rom, written out as the cubic Béziers SVG understands, so the line
 * passes through every point rather than near it — which matters when the
 * points are counts somebody is going to read off the chart.
 *
 * Shared by the dashboard's publishing chart and the traffic chart, which are
 * the same drawing with different numbers in it.
 */
export function curve(coords: { x: number; y: number }[]): string {
  if (coords.length < 2) return "";
  let path = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[i - 1] ?? coords[i];
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const p3 = coords[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    path += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x} ${p2.y}`;
  }
  return path;
}
