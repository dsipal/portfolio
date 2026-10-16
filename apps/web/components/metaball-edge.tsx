import { useId } from "react";

/**
 * Band height in px. A multiple of GRID so the band's grid pattern lines up
 * with the hero's CSS grid, which is anchored to the hero's bottom edge.
 */
export const DRIP_BAND_HEIGHT = 192;
const GRID = 48;
/** Where the hero's surface ends and the drips begin */
const EDGE_Y = 44;

/**
 * The surface is a continuous wave of overlapping ellipses hanging from the
 * edge. Widths are a percentage of the band, so neighbours always overlap by
 * the same fraction: no near-gaps that the goo filter would pinch into spikes.
 */
const WAVE_STEP = 4.5; // % between ellipse centres
const WAVE_RX = 3.2; // % half-width; > WAVE_STEP / 2 so neighbours overlap
const WAVE_RY = [22, 16, 28, 19, 25, 17, 30, 21, 18, 26, 20, 24]; // px sag, varied so the edge looks organic
const WAVE = Array.from({ length: Math.ceil(110 / WAVE_STEP) }, (_, i) => ({
  cx: -5 + i * WAVE_STEP,
  ry: WAVE_RY[i % WAVE_RY.length],
  duration: 6 + ((i * 7) % 5),
  delay: -((i * 1.3) % 6),
}));

/**
 * Drips: [cx %, length px, neck radius px, drop radius px, duration s, delay s].
 * Each is built only from circles so every part stays round: a chain of neck
 * circles slides down to fractions of `length` (NECK) and a drop leads them;
 * the goo filter fuses them into a tapering drip. When the neck retracts the
 * drop separates and falls. EDGE_Y + length + the 48px fall (drip-drop in
 * globals.css) must stay within DRIP_BAND_HEIGHT.
 */
const DRIPS: [number, number, number, number, number, number][] = [
  [7, 78, 14, 14, 6.5, 0],
  [19, 96, 16, 17, 8, -3],
  [34, 62, 13, 13, 5.5, -1.5],
  [43, 90, 15, 16, 7.5, -5],
  [55, 100, 17, 18, 9, -2],
  [68, 70, 14, 14, 6, -4],
  [78, 94, 16, 17, 8.5, -6],
  [92, 84, 15, 15, 7, -1],
];

/** Neck circles as [fraction of the drip length, radius scale]: wide at the edge, narrowing toward the drop */
const NECK: [number, number][] = [
  [0.2, 1.15],
  [0.4, 1],
  [0.6, 0.85],
  [0.8, 0.75],
];

function Shapes() {
  return (
    <>
      {/* The hero's surface, extending above the band so the blur never shows an edge there */}
      <rect x="-10%" y={-GRID} width="120%" height={GRID + EDGE_Y} />
      {WAVE.map(({ cx, ry, duration, delay }) => (
        <ellipse
          key={`w${cx}`}
          className="metaball drip-sway"
          cx={`${cx}%`}
          cy={EDGE_Y}
          rx={`${WAVE_RX}%`}
          ry={ry}
          style={{ animationDuration: `${duration}s`, animationDelay: `${delay}s` }}
        />
      ))}
      {DRIPS.map(([cx, length, neck, drop, duration, delay]) => {
        const timing = { animationDuration: `${duration}s`, animationDelay: `${delay}s` };
        return (
          // Nested <svg> positions the drip at cx% so its circles can be placed in px
          <svg key={`d${cx}`} x={`${cx}%`} overflow="visible">
            {/* Rounded swell the drip grows out of, so it never meets the surface at a sharp angle */}
            <circle className="metaball drip-sway" cx={0} cy={EDGE_Y} r={neck * 1.8} style={timing} />
            {NECK.map(([reach, scale]) => (
              <circle
                key={reach}
                className="metaball drip-neck"
                cx={0}
                cy={EDGE_Y}
                r={neck * scale}
                style={{ ...timing, ["--reach" as string]: `${length * reach}px` }}
              />
            ))}
            <circle
              className="metaball drip-drop"
              cx={0}
              cy={EDGE_Y}
              r={drop}
              style={{ ...timing, ["--reach" as string]: `${length}px` }}
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
          <feGaussianBlur in="SourceGraphic" stdDeviation="10" />
          {/* alpha × 20 − 8: a hard threshold (~0.4) that fuses the blurred shapes into rounded metaballs */}
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8" />
        </filter>
        <filter id={ids.rim} x="-10%" y="-50%" width="120%" height="200%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation="10" />
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8" result="goo" />
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
