import { describe, expect, it } from "vitest";
import { faIconName, resolveFaIcon } from "@/components/fa-icon";

describe("faIconName", () => {
  it.each([
    ["fa-solid code", "FaCode"],
    ["fa-brands github", "FaGithub"],
    ["fa-regular star", "FaRegStar"],
    ["  fa-solid  arrow-up-right-from-square ", "FaArrowUpRightFromSquare"],
    ["fa-light code", null],
    ["code", null],
    ["", null],
    [null, null],
  ])("maps %j to %j", (value, expected) => {
    expect(faIconName(value)).toBe(expected);
  });
});

describe("resolveFaIcon", () => {
  it("returns a component only for icons react-icons has", () => {
    expect(resolveFaIcon("fa-brands github")).toBeTypeOf("function");
    expect(resolveFaIcon("fa-solid not-a-real-icon")).toBeUndefined();
  });
});
