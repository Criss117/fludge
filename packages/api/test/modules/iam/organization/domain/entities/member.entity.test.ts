import { describe, expect, it } from "bun:test";
import { UUID } from "@fludge/utils/uuid";
import { Member } from "@fludge/api/modules/iam/organization/domain/entities/member.entity";

const member = (role: "member" | "owner" = "member") =>
  Member.create({ userId: UUID.generate(), assignedBy: null, role });

describe("Member", () => {
  it("creates owner and regular members with their roles", () => {
    expect(member("owner").role.isOwner()).toBe(true);
    expect(member().role.isMember()).toBe(true);
  });
  it("does not report the opposite role", () => {
    expect(member("owner").role.isMember()).toBe(false);
    expect(member().role.isOwner()).toBe(false);
  });
  it("compares members by ID", () => {
    const one = member();
    expect(one.equals(one)).toBe(true);
    expect(one.equals(member())).toBe(false);
  });
});
