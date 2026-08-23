import { describe, expect, it, mock } from "bun:test";

process.env.TURSO_URL = "https://example.turso.local";
process.env.TURSO_TOKEN = "test-token";
process.env.BETTER_AUTH_SECRET = "test-secret-123456789012345678901234";
process.env.BETTER_AUTH_URL = "http://localhost:3000";
process.env.CORS_ORIGIN = "http://localhost:3001";

function makeProcedure() {
  const procedure = {
    route: () => procedure,
    input: () => procedure,
    handler: (handler: unknown) => ({ handler }),
  };
  return procedure;
}

mock.module("/home/cristian/Projects/fludge/packages/api/src/index.ts", () => ({
  rootOnlyProcedure: makeProcedure(),
  hasPermissionProcedure: () => makeProcedure(),
  protectedProcedure: makeProcedure(),
  requireOrganizationProcedure: makeProcedure(),
}));

const execute = {
  add: mock(() => Promise.resolve("added")),
  assignGroups: mock(() => Promise.resolve("assigned")),
};

mock.module("@fludge/api/modules/iam/organization/container", () => ({
  organizationContainer: {
    commands: { member: {
      add: { execute: execute.add },
      assignGroups: { execute: execute.assignGroups },
    } },
  },
}));

const { memberRouter } = await import(
  "@fludge/api/modules/iam/organization/infrastructure/http/member.router"
);

function makeContext() {
  return {
    session: {
      user: { id: "user-1" },
      activeOrganization: { id: "organization-1" },
    },
  };
}

describe("memberRouter", () => {
  it("delegates add with the user, organization, and input", async () => {
    const input = { userId: "user-2" };
    await memberRouter.commands.add.handler({ input, context: makeContext() } as any);
    expect(execute.add).toHaveBeenCalledWith("user-1", { id: "organization-1" }, input);
  });

  it("delegates assignGroups with the user, organization, and input", async () => {
    const input = { memberId: "member-1", groupIds: ["group-1"] };
    await memberRouter.commands.assignGroups.handler({ input, context: makeContext() } as any);
    expect(execute.assignGroups).toHaveBeenCalledWith(
      "user-1",
      { id: "organization-1" },
      input,
    );
  });
});
