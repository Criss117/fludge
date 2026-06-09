import { describe, expect, it, mock } from "bun:test";
import {
  CreateGroupCommand,
} from "@fludge/api/modules/iam/groups/application/commands/create-group.command";
import type { EventBus } from "@fludge/api/modules/shared/domain/event-bus";
import type { PGGroupsCommandsRepository } from "@fludge/api/modules/iam/groups/infrastructure/repositories/pg-groups-commands.repository";
import { ok, err } from "@fludge/utils/trycatch";

function setup() {
  const registerMock = mock(() => eventBus);
  const dispatchMock = mock(async () => {});

  const eventBus = {
    register: registerMock,
    dispatch: dispatchMock,
  } as unknown as EventBus;

  const saveMock = mock(
    async () =>
      ok({
        id: "g1",
        name: "Admins",
        slug: "admins",
        organizationId: "org1",
        permissions: ["groups:view"],
        description: null,
        createdBy: "m1",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      }),
  );

  const repo = { save: saveMock } as unknown as PGGroupsCommandsRepository;

  const cmd = new CreateGroupCommand(eventBus, repo);

  return { eventBus, registerMock, dispatchMock, repo, saveMock, cmd };
}

describe("CreateGroupCommand", () => {
  it("registers organization:registered listener on construction", () => {
    const { registerMock } = setup();

    expect(registerMock).toHaveBeenCalledWith(
      "organization:registered",
      expect.any(Function),
      { critical: true, listenerName: "CreateGroupCommand" },
    );
  });

  it("executes successfully with valid input", async () => {
    const { cmd, saveMock } = setup();

    const result = await cmd.execute({
      name: "Admins",
      permissions: ["groups:view"],
      organizationId: "org1",
      description: undefined,
      createdBy: { memberId: "m1", name: "Alice", email: "alice@example.com" },
    });

    expect(saveMock).toHaveBeenCalledTimes(1);
    expect(saveMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Admins",
        slug: "admins",
        organizationId: "org1",
        permissions: expect.any(Array),
        createdBy: "m1",
      }),
    );

    expect(result).toEqual(
      expect.objectContaining({
        createdBy: { memberId: "m1", name: "Alice", email: "alice@example.com" },
      }),
    );
  });

  it("throws ORPCError when repository returns an error", async () => {
    const registerMock = mock(() => eventBus);
    const eventBus = {
      register: registerMock,
      dispatch: mock(async () => {}),
    } as unknown as EventBus;

    const saveMock = mock(async () =>
      err(new Error("DB connection failed")),
    );

    const repo = { save: saveMock } as unknown as PGGroupsCommandsRepository;

    const cmd = new CreateGroupCommand(eventBus, repo);

    try {
      await cmd.execute({
        name: "Admins",
        permissions: ["groups:view"],
        organizationId: "org1",
        description: undefined,
        createdBy: null,
      });
      expect.unreachable("Expected ORPCError to be thrown");
    } catch (error: any) {
      expect(error.code).toBe("INTERNAL_SERVER_ERROR");
      expect(error.message).toBeDefined();
    }
  });
});