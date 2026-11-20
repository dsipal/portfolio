import { describe, expect, it } from "vitest";
import { readingTime } from "@/lib/reading-time";

describe("readingTime", () => {
  it("is at least one minute", () => {
    expect(readingTime(null)).toBe(1);
    expect(readingTime("short")).toBe(1);
  });

  it("estimates ~225 words per minute", () => {
    expect(readingTime("word ".repeat(450))).toBe(2);
    expect(readingTime("word ".repeat(2250))).toBe(10);
  });

  it("ignores code blocks and HTML tags", () => {
    const code = "```\n" + "token ".repeat(5000) + "\n```";
    expect(readingTime("word ".repeat(450) + code + "<div class='x'></div>")).toBe(2);
  });
});
