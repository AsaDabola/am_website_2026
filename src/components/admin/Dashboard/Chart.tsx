import type { ChartPoint } from "./data";

/**
 * A year of publishing, drawn as an area.
 *
 * Server-rendered SVG rather than a charting library: it is one series of
 * twelve points, it never changes after the page is drawn, and a library for
 * it would be a client bundle and a hydration step for a shape that is
 * already known on the server.
 *
 * The picture is stretched to whatever width the card is, which is why the
 * strokes carry `vector-effect` — without it a wide card would draw a thick
 * line and a narrow one a thin one — and why the month names sit in HTML
 * underneath instead of inside the drawing.
 */

const WIDTH = 1000;
const HEIGHT = 260;
const TOP = 16;
const BOTTOM = HEIGHT - 16;

/**
 * A rounded path through the points.
 *
 * Catmull-Rom through every point, written out as the cubic Béziers SVG
 * understands, so the line passes through each month rather than near it.
 */
function curve(coords: { x: number; y: number }[]): string {
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

export function Chart({ points }: { points: ChartPoint[] }) {
  if (points.length === 0) return null;

  const peak = Math.max(1, ...points.map((point) => point.value));
  const step = points.length > 1 ? WIDTH / (points.length - 1) : WIDTH;
  const coords = points.map((point, index) => ({
    x: Math.round(index * step),
    y: Math.round(BOTTOM - (point.value / peak) * (BOTTOM - TOP)),
  }));

  const line = curve(coords);
  const area = `${line} L ${WIDTH} ${HEIGHT} L 0 ${HEIGHT} Z`;
  const last = coords[coords.length - 1];

  return (
    <div className="am-chart">
      <div className="am-chart__plot">
        <svg
          aria-hidden="true"
          className="am-chart__svg"
          preserveAspectRatio="none"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        >
        <defs>
          <linearGradient id="am-chart-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--am-accent)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--am-accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75, 1].map((fraction) => (
          <line
            className="am-chart__grid"
            key={fraction}
            vectorEffect="non-scaling-stroke"
            x1="0"
            x2={WIDTH}
            y1={BOTTOM - fraction * (BOTTOM - TOP)}
            y2={BOTTOM - fraction * (BOTTOM - TOP)}
          />
        ))}
          <path className="am-chart__area" d={area} fill="url(#am-chart-fill)" />
          <path className="am-chart__line" d={line} vectorEffect="non-scaling-stroke" />
        </svg>
        {/* The end-of-series marker is HTML so it stays a circle however wide
            the card is; the drawing behind it is stretched, this is not. It
            sits inside the plot rather than the whole chart, so the percentage
            is measured against the drawing and not against the months below
            it as well. */}
        <span className="am-chart__marker" style={{ top: `${(last.y / HEIGHT) * 100}%` }} />
      </div>
      <ol className="am-chart__months">
        {points.map((point, index) => (
          <li key={`${point.label}-${index}`}>
            <span className="am-chart__month">{point.label}</span>
            <span className="am-chart__count">{point.value}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
