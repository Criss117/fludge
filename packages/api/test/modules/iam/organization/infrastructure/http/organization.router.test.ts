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
  register: mock(() => Promise.resolve("registered")),
  update: mock(() => Promise.resolve("updated")),
  findAll: mock(() => Promise.resolve(["organization"])),
};

mock.module("@fludge/api/modules/iam/organization/container", () => ({
  organizationContainer: {
    commands: {
      register: { execute: execute.register },
      update: { execute: execute.update },
    },
    queries: { findAll: { execute: execute.findAll } },
  },
}));

const { organizationRouter } = await import(
  "@fludge/api/modules/iam/organization/infrastructure/http/organization.router"
);

function makeContext() {
  return {
    session: {
      user: { id: "user-1" },
      activeOrganization: { values: { id: "organization-1", name: "Acme" } },
    },
  };
}

describe("organizationRouter", () => {
  it("delegates register with the root user and input", async () => {
    const input = { name: "Acme", legalName: "Acme LLC" };
    await organizationRouter.commands.register.handler({ input, context: makeContext() } as any);
    expect(execute.register).toHaveBeenCalledWith("user-1", input);
  });

  it("delegates update with the active organization and input", async () => {
    const input = { name: "Acme Updated" };
    await organizationRouter.commands.update.handler({ input, context: makeContext() } as any);
    expect(execute.update).toHaveBeenCalledWith(
      makeContext().session.activeOrganization,
      input,
    );
  });

  it("delegates findAll with the current user", async () => {
    await organizationRouter.queries.findAll.handler({ context: makeContext() } as any);
    expect(execute.findAll).toHaveBeenCalledWith("user-1");
  });

  it("returns the active organization values without querying the container", async () => {
    execute.findAll.mockClear();
    const result = await organizationRouter.queries.findActive.handler({ context: makeContext() } as any);
    expect(result).toEqual({ id: "organization-1", name: "Acme" });
    expect(execute.findAll).not.toHaveBeenCalled();
  });
});
