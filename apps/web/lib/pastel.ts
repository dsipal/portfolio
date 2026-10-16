/**
 * Inline <head> script that picks a fresh pastel palette on every full page
 * load and exposes it as --pastel-1..3 on <html>. It runs before first paint
 * so the accent color never flashes, and client navigations keep the palette.
 *
 * pastelColor() is the original cube coloring: each RGB channel in 127–254.
 * Draws whose channels sit too close together come out near-gray, so those
 * are re-rolled until the spread between channels is at least MIN_SPREAD.
 */
const MIN_SPREAD = 60;

export const pastelScript = `(function () {
  try {
    function channel() { return Math.round(Math.random() * 127) + 127; }
    function pastelColor() {
      var rgb;
      do {
        rgb = [channel(), channel(), channel()];
      } while (Math.max.apply(null, rgb) - Math.min.apply(null, rgb) < ${MIN_SPREAD});
      return "#" + rgb.map(function (c) { return c.toString(16).padStart(2, "0"); }).join("");
    }
    var style = document.documentElement.style;
    for (var i = 1; i <= 3; i++) style.setProperty("--pastel-" + i, pastelColor());
  } catch (e) {}
})();`;

/** Read the generated palette (falls back to the CSS defaults) */
export function readPastels(): [string, string, string] {
  const style = getComputedStyle(document.documentElement);
  const get = (i: number) => style.getPropertyValue(`--pastel-${i}`).trim() || "#b4bcf7";
  return [get(1), get(2), get(3)];
}
