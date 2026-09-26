import { describe, expect, it } from "bun:test";
import type { ZodType } from "zod";

import { assignGroupsToMemberValidator } from "../../src/validators/member.validators";

const VALID_UUID = "00000000-0000-4000-8000-000000000001";
const OTHER_UUID = "00000000-0000-4000-8000-000000000002";

function expectParsed<TSchema extends ZodType>(
  schema: TSchema,
  value: unknown,
) {
  const result = schema.safeParse(value);
  expect(result.success, `expected success for ${JSON.stringify(value)}`).toBe(
    true,
  );
  if (!result.success) {
    throw new Error(`expected success but got: ${result.error.message}`);
  }
  return result.data;
}

function expectFirstIssue<TSchema extends ZodType>(
  schema: TSchema,
  value: unknown,
): string {
  const result = schema.safeParse(value);
  expect(result.success, `expected failure for ${JSON.stringify(value)}`).toBe(
    false,
  );
  if (result.success) {
    throw new Error(`expected failure for ${JSON.stringify(value)}`);
  }
  return result.error.issues[0]?.message ?? "";
}

describe("assignGroupsToMemberValidator", () => {
  it("accepts a member id with a single group id", () => {
    const data = expectParsed(assignGroupsToMemberValidator, {
      memberId: VALID_UUID,
      groupIds: [OTHER_UUID],
    });
    expect(data.memberId).toBe(VALID_UUID);
    expect(data.groupIds).toEqual([OTHER_UUID]);
  });

  it("accepts multiple group ids", () => {
    const data = expectParsed(assignGroupsToMemberValidator, {
      memberId: VALID_UUID,
      groupIds: [OTHER_UUID, VALID_UUID],
    });
    expect(data.groupIds).toEqual([OTHER_UUID, VALID_UUID]);
  });

  it("rejects an empty groupIds array", () => {
    expect(expectFirstIssue(assignGroupsToMemberValidator, {
      memberId: VALID_UUID,
      groupIds: [],
    })).toBe("validators.array.at_least_one");
  });

  it("rejects an invalid uuid inside groupIds", () => {
    expect(expectFirstIssue(assignGroupsToMemberValidator, {
      memberId: VALID_UUID,
      groupIds: ["not-a-uuid"],
    })).toBe("validators.uuid.invalid");
  });

  it("rejects a missing memberId", () => {
    expect(expectFirstIssue(assignGroupsToMemberValidator, {
      groupIds: [VALID_UUID],
    })).toBe("validators.uuid.invalid");
  });

  it("rejects a missing groupIds", () => {
    expect(expectFirstIssue(assignGroupsToMemberValidator, {
      memberId: VALID_UUID,
    })).toMatch(/expected array/);
  });

  it("rejects a non-array groupIds", () => {
    expect(expectFirstIssue(assignGroupsToMemberValidator, {
      memberId: VALID_UUID,
      groupIds: VALID_UUID,
    })).toMatch(/expected array/);
  });

  it("rejects a non-uuid memberId", () => {
    expect(expectFirstIssue(assignGroupsToMemberValidator, {
      memberId: "not-a-uuid",
      groupIds: [VALID_UUID],
    })).toBe("validators.uuid.invalid");
  });
});