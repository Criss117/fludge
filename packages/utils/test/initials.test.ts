import { describe, expect, it } from "bun:test";
import { getInitials } from "../src/initials";

describe("getInitials", () => {
  it.each([
    ["John Doe", "JD"],
    ["John", "J"],
    ["John Michael Doe", "JM"],
    ["john doe", "JD"],
    ["  John   Doe  ", "JD"],
    ["", ""],
  ])("returns %s for %s", (name, expected) => {
    expect(getInitials(name)).toBe(expected);
  });
});
