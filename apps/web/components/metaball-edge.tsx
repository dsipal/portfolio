import { useId } from "react";

/**
 * Band height in px. A multiple of GRID so the band's grid pattern lines up
 * with the hero's CSS grid, which is anchored to the hero's bottom edge.
 */
export const DRIP_BAND_HEIGHT = 192;
const GRID = 48;
/** Where the hero's surface ends and the drips begin */
const EDGE_Y = 44;

/** Bulges that hang from the edge and sway gently: [cx %, radius px, duration s, delay s] */
const BULGES: [number, number, number, number][] = [
  [2, 26, 7, 0],
  [11, 20, 6, -2],
  [19, 30, 8, -4],
  [30, 22, 6.5, -1],
  [38, 28, 7.5, -5],
  [47, 18, 6, -3],
  [55, 30, 8.5, -2.5],
  [64, 22, 7, -6],
  [72, 26, 6.5, -0.5],
  [81, 20, 7.5, -3.5],
  [89, 30, 8, -1.5],
  [98, 24, 6.5, -4.5],
];

/**
 * Drips: a stem that stretches down from the edge and a drop at its tip that
 * pinches off and falls: [cx %, length px, stem width px, drop radius px, duration s, delay s].
 * EDGE_Y + length + the 48px fall (drip-drop in globals.css) must stay within DRIP_BAND_HEIGHT.
 */
const DRIPS: [number, number, number, number, number, number][] = [
  [7, 78, 16, 11, 6.5, 0],
  [19, 96, 20, 14, 8, -3],
  [34, 62, 14, 10, 5.5, -1.5],
  [43, 90, 18, 13, 7.5, -5],
  [55, 100, 22, 15, 9, -2],
  [68, 70, 16, 11, 6, -4],
  [78, 94, 20, 14, 8.5, -6],
  [92, 84, 18, 12, 7, -1],
];

function Shapes() {
  return (
    <>
      {/* The hero's surface, extending above the band so the blur never shows an edge there */}
      <rect x="-10%" y={-GRID} width="120%" height={GRID + EDGE_Y} />
      {BULGES.map(([cx, r, duration, delay]) => (
        <circle
          key={`b${cx}`}
          className="metaball drip-sway"
          cx={`${cx}%`}
          cy={EDGE_Y}
          r={r}
          style={{ animationDuration: `${duration}s`, animationDelay: `${delay}s` }}
        />
      ))}
      {DRIPS.map(([cx, length, width, drop, duration, delay]) => {
        const timing = { animationDuration: `${duration}s`, animationDelay: `${delay}s` };
        return (
          // Nested <svg> positions the drip at cx% so its shapes can be centered in px
          <svg key={`d${cx}`} x={`${cx}%`} overflow="visible">
            <rect
              className="metaball drip-stem"
              x={-width / 2}
              y={EDGE_Y - 8}
              width={width}
              height={length}
              rx={width / 2}
              style={timing}
            />
            <circle
              className="metaball drip-drop"
              cx={0}
              cy={EDGE_Y + length}
              r={drop}
              style={{ ...timing, ["--drip" as string]: `${length}px` }}
            />
          </svg>
        );
      })}
    </>
  );
}

/**
 * The bottom of the hero melting into the next section: its grid ends in a
 * liquid edge with drips that stretch, pinch off and fall.
 *
 * The drip shapes are fused into metaballs by an SVG "goo" filter (blur, then
 * a hard alpha threshold). The result masks a grid pattern matching the
 * hero's, and a second pass traces the outline with an accent rim and glow.
 * Pure SVG + CSS keyframes (.metaball / .drip-* in globals.css); the drips
 * hang still under prefers-reduced-motion.
 */
export function MetaballEdge({ className }: { className?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const ids = {
    goo: `goo-${id}`,
    rim: `rim-${id}`,
    drips: `drips-${id}`,
    grid: `grid-${id}`,
    fade: `fade-${id}`,
  };

  return (
    <svg aria-hidden className={className} width="100%" height={DRIP_BAND_HEIGHT}>
      <defs>
        <filter id={ids.goo} x="-10%" y="-50%" width="120%" height="200%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation="7" />
          {/* alpha × 18 − 7: a hard threshold (~0.4) that fuses the blurred shapes */}
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" />
        </filter>
        <filter id={ids.rim} x="-10%" y="-50%" width="120%" height="200%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation="7" />
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
          <feMorphology in="goo" operator="dilate" radius="1.5" result="dilated" />
          <feFlood style={{ floodColor: "var(--brand)" }} floodOpacity="0.8" />
          <feComposite in2="dilated" operator="in" />
          {/* Keep only the outline outside the shape, then add a soft glow */}
          <feComposite in2="goo" operator="out" result="rim" />
          <feGaussianBlur in="rim" stdDeviation="4" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="rim" />
          </feMerge>
        </filter>

        {/* Same lines as the hero's CSS grid: 1px at the top/left of each 48px cell */}
        <pattern id={ids.grid} width={GRID} height={GRID} patternUnits="userSpaceOnUse">
          <path d={`M0 0.5H${GRID}M0.5 0V${GRID}`} fill="none" style={{ stroke: "var(--border)" }} />
        </pattern>
        {/* Same horizontal fade as the hero grid's side mask */}
        <linearGradient id={`${ids.fade}-g`}>
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.2" stopColor="#fff" />
          <stop offset="0.8" stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id={ids.fade} maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
          <rect width="100%" height="100%" fill={`url(#${ids.fade}-g)`} />
        </mask>
        <mask id={ids.drips} maskUnits="userSpaceOnUse" x="-10%" y="-50%" width="120%" height="200%">
          <g fill="#fff" filter={`url(#${ids.goo})`}>
            <Shapes />
          </g>
        </mask>
      </defs>

      {/* The hero's material (its grid) in the shape of the drips */}
      <g mask={`url(#${ids.drips})`}>
        <rect
          width="100%"
          height="100%"
          fill={`url(#${ids.grid})`}
          mask={`url(#${ids.fade})`}
          opacity="0.6"
        />
      </g>
      {/* Accent outline tracing the dripping edge */}
      <g filter={`url(#${ids.rim})`} fill="#fff">
        <Shapes />
      </g>
    </svg>
  );
}
