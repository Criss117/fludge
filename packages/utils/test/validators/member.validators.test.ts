import { describe, expect, it } from "bun:test";

import {
  assignGroupsToMemberValidator,
} from "@fludge/utils/validators/member.validators";

const VALID_UUID = "00000000-0000-4000-8000-000000000001";

describe("assignGroupsToMemberValidator", () => {
  it("accepts a valid assignment", () => {
    expect(
      assignGroupsToMemberValidator.parse({
        memberId: VALID_UUID,
        groupIds: [VALID_UUID],
      }),
    ).toEqual({ memberId: VALID_UUID, groupIds: [VALID_UUID] });
  });

  it("rejects an invalid memberId", () => {
    expect(() =>
      assignGroupsToMemberValidator.parse({
        memberId: "nope",
        groupIds: [VALID_UUID],
      }),
    ).toThrow();
  });

  it("rejects an empty groupIds array", () => {
    expect(() =>
      assignGroupsToMemberValidator.parse({
        memberId: VALID_UUID,
        groupIds: [],
      }),
    ).toThrow();
  });
});