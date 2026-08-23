import { describe, expect, it } from "bun:test";
import { Slug } from "../src/slugify";

describe("Slug", () => {
  it.each([
    ["Hello World", "hello-world"],
    ["Hello, World!", "hello-world"],
    ["hello   world---again", "hello-world-again"],
    ["hello_world", "hello-world"],
    ["  hello  ", "hello"],
  ])("normalizes %s to %s", (value, expected) => {
    expect(new Slug(value).toString()).toBe(expected);
  });

  it("compares equal slugs", () => {
    expect(new Slug("Hello World").equals(new Slug("hello-world"))).toBe(true);
  });

  it("does not compare different slugs as equal", () => {
    expect(new Slug("foo").equals(new Slug("bar"))).toBe(false);
  });

  it("returns its normalized value from toString", () => {
    expect(new Slug("Hello World").toString()).toBe("hello-world");
  });
});
