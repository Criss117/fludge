import { describe, test, expect } from "bun:test";
import {
  MILISECOND,
  SECOND,
  MINUTE,
  HOUR,
  DAY,
  ORGANIZATION_HEADER_kEY,
} from "@fludge/utils/constants";

describe("time constants", () => {
  test("MILISECOND is the base unit (1)", () => {
    expect(MILISECOND).toBe(1);
  });

  test("SECOND is 1000 milliseconds", () => {
    expect(SECOND).toBe(1000);
    expect(SECOND).toBe(1000 * MILISECOND);
  });

  // Note: the source uses `1000 * <unit>` rather than the conventional
  // 60×/24× multipliers. These tests pin the actual computed values.
  test("MINUTE is computed as 1000 * SECOND", () => {
    expect(MINUTE).toBe(1000 * SECOND);
    expect(MINUTE).toBe(1_000_000);
  });

  test("HOUR is computed as 1000 * MINUTE", () => {
    expect(HOUR).toBe(1000 * MINUTE);
    expect(HOUR).toBe(1_000_000_000);
  });

  test("DAY is computed as 1000 * HOUR", () => {
    expect(DAY).toBe(1000 * HOUR);
    expect(DAY).toBe(1_000_000_000_000);
  });
});

describe("ORGANIZATION_HEADER_kEY", () => {
  test("is the lowercase organization id header", () => {
    expect(ORGANIZATION_HEADER_kEY).toBe("x-organization-id");
  });
});