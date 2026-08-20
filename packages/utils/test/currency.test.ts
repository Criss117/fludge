import { describe, test, expect } from "bun:test";
import { formatPrice } from "@fludge/utils/currency";

describe("formatPrice", () => {
  test("formats zero", () => {
    expect(formatPrice(0)).toBe("$0.00");
  });

  test("formats an integer with two decimals", () => {
    expect(formatPrice(1)).toBe("$1.00");
    expect(formatPrice(10)).toBe("$10.00");
    expect(formatPrice(100)).toBe("$100.00");
  });

  test("formats fractional values", () => {
    expect(formatPrice(1.5)).toBe("$1.50");
    expect(formatPrice(0.99)).toBe("$0.99");
    expect(formatPrice(1234.56)).toBe("$1,234.56");
  });

  test("adds thousands separators for large numbers", () => {
    expect(formatPrice(1000)).toBe("$1,000.00");
    expect(formatPrice(1000.5)).toBe("$1,000.50");
    expect(formatPrice(1000000)).toBe("$1,000,000.00");
  });

  test("formats negative values with a leading minus", () => {
    expect(formatPrice(-42)).toBe("-$42.00");
  });
});