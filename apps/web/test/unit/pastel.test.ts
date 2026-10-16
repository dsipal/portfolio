import { describe, expect, it } from "vitest";
import { pastelScript } from "@/lib/pastel";

function runScript() {
  const vars: Record<string, string> = {};
  const document = { documentElement: { style: { setProperty: (k: string, v: string) => (vars[k] = v) } } };
  new Function("document", pastelScript)(document);
  return vars;
}

describe("pastelScript", () => {
  it("sets three pastel colors", () => {
    expect(Object.keys(runScript())).toEqual(["--pastel-1", "--pastel-2", "--pastel-3"]);
  });

  it("only produces pastel, non-gray colors", () => {
    for (let i = 0; i < 1000; i++) {
      for (const color of Object.values(runScript())) {
        expect(color).toMatch(/^#[0-9a-f]{6}$/);
        const channels = [1, 3, 5].map((j) => parseInt(color.slice(j, j + 2), 16));
        expect(Math.min(...channels)).toBeGreaterThanOrEqual(127);
        expect(Math.max(...channels)).toBeLessThanOrEqual(254);
        expect(Math.max(...channels) - Math.min(...channels)).toBeGreaterThanOrEqual(60);
      }
    }
  });
});
