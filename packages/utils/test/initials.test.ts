import { describe, test, expect } from "bun:test";
import { getInitials } from "@fludge/utils/initials";

describe("getInitials", () => {
  test("returns initials for a two-word name", () => {
    expect(getInitials("John Doe")).toBe("JD");
  });

  test("returns a single initial for a one-word name", () => {
    expect(getInitials("John")).toBe("J");
  });

  test("takes only the first two words regardless of word count", () => {
    expect(getInitials("John Middle Doe")).toBe("JM");
    expect(getInitials("a b c")).toBe("AB");
  });

  test("uppercases lowercase input", () => {
    expect(getInitials("john doe")).toBe("JD");
  });

  test("collapses multiple whitespace separators", () => {
    expect(getInitials("John   Doe")).toBe("JD");
  });

  test("trims leading and trailing whitespace before splitting", () => {
    expect(getInitials("  John  Doe  ")).toBe("JD");
  });

  test("returns empty string for empty input", () => {
    expect(getInitials("")).toBe("");
  });

  test("returns empty string for whitespace-only input", () => {
    expect(getInitials("   ")).toBe("");
  });
});