import { curve } from "../curve";

/**
 * Views and visits over a window of days.
 *
 * Two series on one pair of axes, both scaled to the larger — visits are a
 * subset of views, so a second scale would draw them overlapping and say
 * something untrue about the relationship between them.
 *
 * Server-rendered SVG, stretched to the width of the card, so the strokes
 * carry `vector-effect` and the dates sit in HTML underneath rather than
 * inside the drawing.
 */

const WIDTH = 1000;
const HEIGHT = 260;
const TOP = 16;
const BOTTOM = HEIGHT - 16;

export type DayPoint = { day: string; views: number; visits: number };

/**
 * Which dates to write under the chart.
 *
 * Ninety of them will not fit, and half-drawn dates are worse than fewer, so
 * roughly eight are spaced across the window and the rest are left blank. The
 * last day is worth naming — "up to when" is the first thing anyone asks — but
 * only when it is far enough from the one before it to be read as its own
 * label rather than as a smudge against it.
 */
function labelEvery(count: number): number {
  return Math.max(1, Math.ceil(count / 8));
}

function showsLabel(index: number, count: number, every: number): boolean {
  if (index % every === 0) return true;
  return index === count - 1 && (count - 1) % every > every / 2;
}

function shortDate(day: string): string {
  const date = new Date(`${day}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return day;
  return date.toLocaleDateString("en", { day: "numeric", month: "short", timeZone: "UTC" });
}

export function TrafficChart({ points }: { points: DayPoint[] }) {
  if (points.length === 0) return null;

  const peak = Math.max(1, ...points.map((point) => Math.max(point.views, point.visits)));
  const step = points.length > 1 ? WIDTH / (points.length - 1) : WIDTH;
  const project = (value: number, index: number) => ({
    x: Math.round(index * step),
    y: Math.round(BOTTOM - (value / peak) * (BOTTOM - TOP)),
  });

  const viewCoords = points.map((point, index) => project(point.views, index));
  const visitCoords = points.map((point, index) => project(point.visits, index));

  const viewLine = curve(viewCoords);
  const visitLine = curve(visitCoords);
  const viewArea = `${viewLine} L ${WIDTH} ${HEIGHT} L 0 ${HEIGHT} Z`;
  const last = viewCoords[viewCoords.length - 1];
  const every = labelEvery(points.length);

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
            <linearGradient id="am-traffic-fill" x1="0" x2="0" y1="0" y2="1">
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
          <path className="am-chart__area" d={viewArea} fill="url(#am-traffic-fill)" />
          <path className="am-chart__line" d={viewLine} vectorEffect="non-scaling-stroke" />
          <path
            className="am-chart__line am-chart__line--second"
            d={visitLine}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <span className="am-chart__marker" style={{ top: `${(last.y / HEIGHT) * 100}%` }} />
      </div>
      <ol className="am-chart__months">
        {points.map((point, index) => (
          <li key={point.day}>
            <span className="am-chart__month">
              {showsLabel(index, points.length, every) ? shortDate(point.day) : " "}
            </span>
          </li>
        ))}
      </ol>
      <p className="am-chart__key">
        <span className="am-chart__key-item am-chart__key-item--views">Page views</span>
        <span className="am-chart__key-item am-chart__key-item--visits">Visits</span>
        {/* The scale floors at one so an empty chart still has an axis, which
            would otherwise announce a busiest day of 1 on a window where
            nothing at all was recorded. */}
        {points.some((point) => point.views > 0) && (
          <span className="am-chart__key-peak">Busiest day {peak.toLocaleString("en")}</span>
        )}
      </p>
    </div>
  );
}
