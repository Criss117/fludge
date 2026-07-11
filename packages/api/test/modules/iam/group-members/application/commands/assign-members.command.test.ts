import { describe, expect, it, mock } from "bun:test";

import {
  AssignMembersCommand,
  assignMembersCommand,
} from "@fludge/api/modules/iam/group-members/application/commands/assign-members.command";
import type { OrganizationHasMembersQuery } from "@fludge/api/modules/iam/organizations/application/queries/organization-has-members.query";
import type { OrganizationHasGroupsQuery } from "@fludge/api/modules/iam/organizations/application/queries/organization-has-groups.query";
import type { PgGroupMembersCommandsRepository } from "@fludge/api/modules/iam/group-members/infrastructure/repositories/pg-group-members-commands.repository";
import { ok, err } from "@fludge/utils/trycatch";

// ---------------------------------------------------------------------------
// Schema tests
// ---------------------------------------------------------------------------

const validUuid = "00000000-0000-1000-8000-000000000000";

describe("assignMembersCommand schema — groupIds", () => {
  it("accepts a non-empty array of valid UUIDs", () => {
    expect(assignMembersCommand.safeParse({ groupIds: [validUuid], memberIds: ["m1"] }).success).toBe(true);
  });

  it("rejects an empty groupIds array", () => {
    const result = assignMembersCommand.safeParse({ groupIds: [], memberIds: ["m1"] });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === "groupIds");
      expect(issue?.message).toBe("Debe especificar al menos un id de grupo.");
    }
  });

  it("rejects an invalid UUID inside groupIds", () => {
    const result = assignMembersCommand.safeParse({ groupIds: ["not-a-uuid"], memberIds: ["m1"] });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find(
        (i) => i.message === "Id de grupo no válido.",
      );
      expect(issue).toBeDefined();
    }
  });
});

describe("assignMembersCommand schema — memberIds", () => {
  it("accepts a non-empty array of strings", () => {
    expect(
      assignMembersCommand.safeParse({ groupIds: [validUuid], memberIds: ["m1", "m2"] }).success,
    ).toBe(true);
  });

  it("rejects an empty memberIds array", () => {
    const result = assignMembersCommand.safeParse({ groupIds: [validUuid], memberIds: [] });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === "memberIds");
      expect(issue?.message).toBe("Debe especificar al menos un id de miembro.");
    }
  });
});

// ---------------------------------------------------------------------------
// Handler tests
// ---------------------------------------------------------------------------

function setup(overrides: {
  hasGroups?: boolean;
  hasMembers?: boolean;
  assignResult?: any;
  assignError?: Error;
} = {}) {
  const organizationHasGroupsQuery = {
    execute: mock(async () => ({ exists: overrides.hasGroups ?? true })),
  } as unknown as OrganizationHasGroupsQuery;

  const organizationHasMembersQuery = {
    execute: mock(async () => ({ exists: overrides.hasMembers ?? true })),
  } as unknown as OrganizationHasMembersQuery;

  let capturedAssign: any;
  const assignMembersMock = mock(async (values: any) => {
    capturedAssign = values;
    if (overrides.assignError) return err(overrides.assignError);
    return ok(overrides.assignResult ?? [{ id: "gm-1" }]);
  });

  const repo = {
    assignMembers: assignMembersMock,
  } as unknown as PgGroupMembersCommandsRepository;

  const cmd = new AssignMembersCommand(
    organizationHasMembersQuery,
    organizationHasGroupsQuery,
    repo,
  );

  return {
    cmd,
    assignMembersMock,
    organizationHasGroupsQuery,
    organizationHasMembersQuery,
    getCapturedAssign: () => capturedAssign,
  };
}

const validCmd = {
  groupIds: ["g1", "g2"],
  memberIds: ["m1", "m2"],
  organizationId: "org-1",
  assignedBy: { memberId: "admin-1" },
};

describe("AssignMembersCommand handler", () => {
  it("assigns all group-member combinations and returns data", async () => {
    const { cmd, assignMembersMock, getCapturedAssign } = setup();

    const result = await cmd.execute(validCmd);

    expect(assignMembersMock).toHaveBeenCalledTimes(1);
    const captured = getCapturedAssign();
    // 2 groups × 2 members = 4 assignments
    expect(captured).toHaveLength(4);
    expect(captured).toContainEqual({
      groupId: "g1",
      memberId: "m1",
      assignedBy: "admin-1",
    });
    expect(captured).toContainEqual({
      groupId: "g2",
      memberId: "m2",
      assignedBy: "admin-1",
    });

    expect(result).toEqual([{ id: "gm-1" }]);
  });

  it("throws NOT_FOUND when organization does not have all groups", async () => {
    const { cmd, assignMembersMock } = setup({ hasGroups: false });

    try {
      await cmd.execute(validCmd);
      expect.unreachable("Expected NOT_FOUND");
    } catch (error: any) {
      expect(error.code).toBe("NOT_FOUND");
    }

    expect(assignMembersMock).not.toHaveBeenCalled();
  });

  it("throws NOT_FOUND when organization does not have all members", async () => {
    const { cmd, assignMembersMock } = setup({ hasMembers: false });

    try {
      await cmd.execute(validCmd);
      expect.unreachable("Expected NOT_FOUND");
    } catch (error: any) {
      expect(error.code).toBe("NOT_FOUND");
    }

    expect(assignMembersMock).not.toHaveBeenCalled();
  });

  it("throws INTERNAL_SERVER_ERROR when assignMembers returns error", async () => {
    const { cmd } = setup({ assignError: new Error("DB down") });

    try {
      await cmd.execute(validCmd);
      expect.unreachable("Expected INTERNAL_SERVER_ERROR");
    } catch (error: any) {
      expect(error.code).toBe("INTERNAL_SERVER_ERROR");
    }
  });

  it("passes organizationId to both queries", async () => {
    const { cmd, organizationHasGroupsQuery, organizationHasMembersQuery } = setup();

    await cmd.execute(validCmd);

    expect(organizationHasGroupsQuery.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: "org-1",
        groupIds: ["g1", "g2"],
      }),
    );
    expect(organizationHasMembersQuery.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: "org-1",
        memberIds: ["m1", "m2"],
        options: { filterBy: "member" },
      }),
    );
  });
});