import { describe, expect, it } from "bun:test";
import {
  DAY,
  HOUR,
  MILISECOND,
  MINUTE,
  ORGANIZATION_HEADER_kEY,
  SECOND,
} from "../src/constants";

describe("time constants", () => {
  it("defines the expected millisecond values", () => {
    expect(MILISECOND).toBe(1);
    expect(SECOND).toBe(1_000);
    expect(MINUTE).toBe(60_000);
    expect(HOUR).toBe(3_600_000);
    expect(DAY).toBe(86_400_000);
  });

  it("defines the organization header key", () => {
    expect(ORGANIZATION_HEADER_kEY).toBe("x-organization-id");
  });
});
