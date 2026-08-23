import { describe, expect, it } from "bun:test";
import { z } from "zod";
import { Permissions } from "../src/permissions";

describe("Permissions", () => {
  it("creates permissions from valid statements", () => {
    const permissions = Permissions.create({ groups: ["create", "read"] });

    expect(permissions.has("groups", "create")).toBe(true);
    expect(permissions.has("groups", "read")).toBe(true);
  });

  it("rejects invalid actions with a ZodError", () => {
    expect(() =>
      Permissions.create({ groups: ["invalid"] as never }),
    ).toThrow(z.ZodError);
  });

  it("parses untyped objects and JSON strings", () => {
    expect(Permissions.fromUntyped({ groups: ["read"] }).has("groups", "read")).toBe(
      true,
    );
    expect(Permissions.fromJSON('{"groups":["read"]}').has("groups", "read")).toBe(
      true,
    );
  });

  it("creates empty permissions without granting actions", () => {
    expect(Permissions.empty().has("groups", "read")).toBe(false);
  });

  it("returns false for missing actions and resources", () => {
    const permissions = Permissions.create({ groups: ["read"] });

    expect(permissions.has("groups", "delete")).toBe(false);
    expect(permissions.has("products", "read")).toBe(false);
  });

  it("merges permissions and removes duplicate actions", () => {
    const merged = Permissions.merge([
      Permissions.create({ groups: ["read", "create"] }),
      Permissions.create({ groups: ["read", "delete"] }),
    ]);

    expect(merged.value.groups).toEqual(["read", "create", "delete"]);
  });

  it("checks whether all required permissions are satisfied", () => {
    const granted = Permissions.create({ groups: ["read", "update"] });

    expect(granted.satisfies({ groups: ["read"] })).toBe(true);
    expect(granted.satisfies({ groups: ["delete"] })).toBe(false);
    expect(granted.satisfies({})).toBe(true);
  });

  it("checks combined permissions with hasAll", () => {
    expect(
      Permissions.hasAll(
        [Permissions.create({ groups: ["read"] }), Permissions.create({ groups: ["update"] })],
        { groups: ["read", "update"] },
      ),
    ).toBe(true);
  });

  it("compares equal and different permissions", () => {
    const read = Permissions.create({ groups: ["read"] });

    expect(read.equals(Permissions.create({ groups: ["read"] }))).toBe(true);
    expect(read.equals(Permissions.create({ groups: ["create"] }))).toBe(false);
  });

  it("keeps permissions immutable after creation", () => {
    const permissions = Permissions.create({ groups: ["read"] });
    const original = permissions.value.groups;

    expect(() => {
      (permissions.value.groups as string[]).push("delete");
    }).toThrow();
    expect(permissions.value.groups).toBe(original);
  });
});
