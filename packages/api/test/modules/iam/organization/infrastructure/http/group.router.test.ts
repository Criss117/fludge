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
  create: mock(() => Promise.resolve("created")),
  update: mock(() => Promise.resolve("updated")),
  assignMembers: mock(() => Promise.resolve("assigned")),
};

mock.module("@fludge/api/modules/iam/organization/container", () => ({
  organizationContainer: {
    commands: { group: {
      create: { execute: execute.create },
      update: { execute: execute.update },
      assignMembers: { execute: execute.assignMembers },
    } },
  },
}));

const { groupRouter } = await import(
  "@fludge/api/modules/iam/organization/infrastructure/http/group.router"
);

function makeContext() {
  return {
    session: {
      user: { id: "user-1" },
      activeOrganization: { id: "organization-1" },
    },
  };
}

describe("groupRouter", () => {
  it("delegates create with the user, organization, and input", async () => {
    const input = { name: "Editors", description: "Can edit", permissions: {} };
    await groupRouter.commands.create.handler({ input, context: makeContext() } as any);
    expect(execute.create).toHaveBeenCalledWith("user-1", { id: "organization-1" }, input);
  });

  it("delegates update with the active organization and input", async () => {
    const input = { id: "group-1", name: "Reviewers" };
    await groupRouter.commands.update.handler({ input, context: makeContext() } as any);
    expect(execute.update).toHaveBeenCalledWith({ id: "organization-1" }, input);
  });

  it("preserves the assingMembers procedure typo and delegates its input", async () => {
    const input = { groupId: "group-1", memberIds: ["member-1"] };
    await groupRouter.commands.assingMembers.handler({ input, context: makeContext() } as any);
    expect(execute.assignMembers).toHaveBeenCalledWith(
      "user-1",
      { id: "organization-1" },
      input,
    );
  });
});
