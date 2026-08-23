import { describe, expect, it } from "bun:test";
import { UUID } from "@fludge/utils/uuid";
import { GroupMember } from "../src/modules/iam/organization/domain/entities/group-member.entity";

describe("GroupMember", () => {
  it("creates a relationship and preserves its UUIDs", () => {
    const groupId = UUID.generate();
    const memberId = UUID.generate();
    const createdBy = UUID.generate();
    const relationship = GroupMember.create({ groupId: groupId.toString(), memberId: memberId.toString(), createdBy: createdBy.toString() });
    expect(relationship.groupId.toString()).toBe(groupId.toString());
    expect(relationship.memberId.toString()).toBe(memberId.toString());
    expect(relationship.values.createdBy).toBe(createdBy.toString());
  });
  it("equals only a matching group/member pair", () => {
    const group = UUID.generate();
    const member = UUID.generate();
    const relationship = GroupMember.create({ groupId: group.toString(), memberId: member.toString(), createdBy: null });
    expect(relationship.equals(group, member)).toBe(true);
    expect(relationship.equals(UUID.generate(), member)).toBe(false);
    expect(relationship.equals(group, UUID.generate())).toBe(false);
  });
});
