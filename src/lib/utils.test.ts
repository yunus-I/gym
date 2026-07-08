import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("joins multiple class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("ignores falsy values", () => {
    expect(cn("a", false, null, undefined, 0 && "x", "b")).toBe("a b");
  });

  it("supports conditional object syntax", () => {
    expect(cn("base", { active: true, disabled: false })).toBe("base active");
  });

  it("flattens arrays of class names", () => {
    expect(cn(["a", "b"], "c")).toBe("a b c");
  });

  it("merges conflicting tailwind classes keeping the last one", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });

  it("returns an empty string with no arguments", () => {
    expect(cn()).toBe("");
  });
});
