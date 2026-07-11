import { describe, test, expect } from "bun:test";
import { slugify } from "@fludge/utils/slugify";

describe("slugify", () => {
  test("converts a basic two-word string", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  test("removes special characters", () => {
    expect(slugify("Hello, World!")).toBe("hello-world");
  });

  test("collapses multiple spaces into a single hyphen", () => {
    expect(slugify("Hello   World")).toBe("hello-world");
  });

  test("normalizes mixed case to lowercase", () => {
    expect(slugify("HeLLo WoRLD")).toBe("hello-world");
  });

  test("collapses underscores into hyphens", () => {
    expect(slugify("hello_world")).toBe("hello-world");
  });

  test("collapses multiple hyphens into one", () => {
    expect(slugify("hello--world")).toBe("hello-world");
  });

  test("collapses mixed whitespace, underscore, and hyphen runs", () => {
    expect(slugify("hello - world")).toBe("hello-world");
  });

  test("preserves digits", () => {
    expect(slugify("product 42")).toBe("product-42");
  });

  test("returns empty string for special-chars-only input", () => {
    expect(slugify("!!!@@@")).toBe("");
  });

  test("returns empty string for empty input", () => {
    expect(slugify("")).toBe("");
  });

  // Note: trim() runs AFTER the whitespace→hyphen replacement, so it only
  // strips whitespace — leading/trailing whitespace has already been converted
  // to hyphens. This characterizes the current behavior.
  test("converts leading/trailing whitespace into leading/trailing hyphens", () => {
    expect(slugify("  Hello World  ")).toBe("-hello-world-");
  });

  test("strips non-ASCII letters (accents) because \\w is ASCII-only", () => {
    expect(slugify("café résumé")).toBe("caf-rsum");
  });
});