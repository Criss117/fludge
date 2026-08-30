import { describe, expect, it } from "bun:test";
import { filterMembers } from "@fludge/client/application/iam/organization/queries/use-find-members";

const members = [
  { id: "ana", role: "member", user: { name: "Ana", email: "ana@example.com" } },
  { id: "beto", role: "member", user: { name: "Beto", email: "beto@example.com" } },
  { id: "owner", role: "owner", user: { name: "Owner", email: "owner@example.com" } },
];

const groupMembers = [
  { groupId: "g1", memberId: "ana" },
  { groupId: "g2", memberId: "beto" },
];

describe("filterMembers", () => {
  it("excludes members assigned to the requested group", () => {
    const result = filterMembers(members, groupMembers, { excludeByGroupId: "g1" });

    expect(result.map((member) => member.id)).toEqual(["beto", "owner"]);
  });

  it("filters by search text and excludes owners", () => {
    const result = filterMembers(members, groupMembers, {
      query: "EXAMPLE.COM",
      excludeOwners: true,
    });

    expect(result.map((member) => member.id)).toEqual(["ana", "beto"]);
  });

  it("rejects mutually exclusive group filters", () => {
    expect(() =>
      filterMembers(members, groupMembers, {
        byGroupId: "g1",
        excludeByGroupId: "g1",
      }),
    ).toThrow("byGroupId and excludeByGroupId cannot be used together");
  });
});
