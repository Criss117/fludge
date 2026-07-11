import { describe, expect, it, mock } from "bun:test";

import {
  UnAssignMembersCommand,
  unassignMembersCommand,
} from "@fludge/api/modules/iam/group-members/application/commands/unassign-members.command";
import type { PgGroupMembersCommandsRepository } from "@fludge/api/modules/iam/group-members/infrastructure/repositories/pg-group-members-commands.repository";
import { ok, err } from "@fludge/utils/trycatch";

// ---------------------------------------------------------------------------
// Schema tests — unassignMembersCommand reuses assignMembersCommand
// ---------------------------------------------------------------------------

const validUuid = "00000000-0000-1000-8000-000000000000";

describe("unassignMembersCommand schema — groupIds", () => {
  it("accepts a non-empty array of valid UUIDs", () => {
    expect(
      unassignMembersCommand.safeParse({ groupIds: [validUuid], memberIds: ["m1"] }).success,
    ).toBe(true);
  });

  it("rejects an empty groupIds array", () => {
    const result = unassignMembersCommand.safeParse({ groupIds: [], memberIds: ["m1"] });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === "groupIds");
      expect(issue?.message).toBe("Debe especificar al menos un id de grupo.");
    }
  });
});

describe("unassignMembersCommand schema — memberIds", () => {
  it("accepts a non-empty array of strings", () => {
    expect(
      unassignMembersCommand.safeParse({
        groupIds: [validUuid],
        memberIds: ["m1", "m2"],
      }).success,
    ).toBe(true);
  });

  it("rejects an empty memberIds array", () => {
    const result = unassignMembersCommand.safeParse({ groupIds: [validUuid], memberIds: [] });
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

function setup(overrides: { unassignError?: Error } = {}) {
  let capturedUnassign: any;
  const unassignMembersMock = mock(async (values: any) => {
    capturedUnassign = values;
    if (overrides.unassignError) return err(overrides.unassignError);
    return ok(null);
  });

  const repo = {
    unassignMembers: unassignMembersMock,
  } as unknown as PgGroupMembersCommandsRepository;

  const cmd = new UnAssignMembersCommand(repo);

  return { cmd, unassignMembersMock, getCapturedUnassign: () => capturedUnassign };
}

const validCmd = {
  groupIds: ["g1", "g2"],
  memberIds: ["m1", "m2"],
  organizationId: "org-1",
};

describe("UnAssignMembersCommand handler", () => {
  it("unassigns members from groups and returns void on success", async () => {
    const { cmd, unassignMembersMock, getCapturedUnassign } = setup();

    const result = await cmd.execute(validCmd);

    expect(unassignMembersMock).toHaveBeenCalledTimes(1);
    const captured = getCapturedUnassign();
    expect(captured.groupIds).toEqual(["g1", "g2"]);
    expect(captured.memberIds).toEqual(["m1", "m2"]);

    // execute returns undefined (void) on success
    expect(result).toBeUndefined();
  });

  it("throws INTERNAL_SERVER_ERROR when unassignMembers returns error", async () => {
    const { cmd } = setup({ unassignError: new Error("DB down") });

    try {
      await cmd.execute(validCmd);
      expect.unreachable("Expected INTERNAL_SERVER_ERROR");
    } catch (error: any) {
      expect(error.code).toBe("INTERNAL_SERVER_ERROR");
    }
  });
});