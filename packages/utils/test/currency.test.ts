import { describe, expect, it } from "bun:test";
import { formatPrice } from "../src/currency";

describe("formatPrice", () => {
  it.each([
    [100, "$100.00"],
    [19.99, "$19.99"],
    [0, "$0.00"],
    [1_000_000, "$1,000,000.00"],
    [-50, "-$50.00"],
  ])("formats %s as %s", (price, expected) => {
    expect(formatPrice(price)).toBe(expected);
  });
});
