import { describe, expect, it } from "bun:test";
import { ZodError } from "zod";
import {
  getPermissionByResource,
  getPermissionDescription,
  permissionsFromObject,
  Permissions,
} from "@fludge/utils/permissions/index";

describe("Permissions", () => {
  describe("create", () => {
    it("adds the read permission for non-organization resources", () => {
      expect(Permissions.create(["groups:delete"]).values).toEqual([
        "groups:delete",
        "groups:read",
      ]);
    });

    it("does not add an organization read permission", () => {
      expect(Permissions.create(["organizations:update"]).values).toEqual([
        "organizations:update",
      ]);
    });

    it("deduplicates an existing read permission", () => {
      expect(Permissions.create(["groups:read"]).values).toEqual([
        "groups:read",
      ]);
    });

    it("adds one read permission per resource", () => {
      expect(
        Permissions.create(["groups:delete", "members:delete"]).values,
      ).toEqual([
        "groups:delete",
        "members:delete",
        "groups:read",
        "members:read",
      ]);
    });
  });

  it("reconstitutes values verbatim and merges unique values", () => {
    const first = Permissions.reconstitute(["groups:read", "members:create"]);
    const second = Permissions.reconstitute(["groups:delete", "groups:read"]);

    expect(first.values).toEqual(["groups:read", "members:create"]);
    expect(Permissions.merge([first, second]).values).toEqual([
      "groups:read",
      "members:create",
      "groups:delete",
    ]);
  });

  describe("query helpers", () => {
    const permissions = Permissions.reconstitute(["groups:read", "groups:delete"]);

    it("checks a single permission", () => {
      expect(permissions.hasPermission("groups:read")).toBe(true);
      expect(permissions.hasPermission("members:read")).toBe(false);
    });

    it("checks all permissions from a string or array", () => {
      expect(permissions.hasAllPermissions("groups:read")).toBe(true);
      expect(permissions.hasAllPermissions(["groups:read", "groups:delete"])).toBe(
        true,
      );
      expect(permissions.hasAllPermissions(["groups:read", "members:read"])).toBe(
        false,
      );
    });

    it("checks whether any permission from a string or array matches", () => {
      expect(permissions.hasAnyPermission("groups:read")).toBe(true);
      expect(permissions.hasAnyPermission(["members:read", "groups:read"])).toBe(
        true,
      );
      expect(permissions.hasAnyPermission(["members:read", "members:create"])).toBe(
        false,
      );
    });

    it("supports all and any check modes", () => {
      const requested = ["groups:read", "members:read"] as const;

      expect(permissions.checkPermissions([...requested], "any")).toBe(true);
      expect(permissions.checkPermissions([...requested])).toBe(false);
    });
  });

  describe("JSON serialization", () => {
    it("round-trips values through JSON", () => {
      const original = ["groups:read", "members:create"] as const;
      const permissions = Permissions.reconstitute([...original]);

      expect(Permissions.fromJSON(permissions.toJSON()).values).toEqual(original);
    });

    it("rejects empty and unknown permission arrays", () => {
      expect(() => Permissions.fromJSON(JSON.stringify([]))).toThrow(ZodError);
      expect(() =>
        Permissions.fromJSON(JSON.stringify([["sales", "read"].join(":")])),
      ).toThrow(ZodError);
    });
  });

  describe("lookup helpers", () => {
    it("returns localized descriptions and falls back for unmapped actions", () => {
      expect(getPermissionDescription("groups:read")).toMatchObject({
        title: "Ver grupos",
        target: "Grupos",
      });
      expect(getPermissionDescription("groups:assign-member")).toMatchObject({
        title: "Asignar miembros a grupos",
        target: "Grupos",
      });
    });

    it("returns a fallback for an unknown runtime permission", () => {
      expect(getPermissionDescription("groups:unknown" as never)).toEqual({
        title: "unknown",
        description: "Descripción no disponible",
        target: "Grupos",
      });
    });

    it("lists resource permissions and flattens object statements", () => {
      expect(getPermissionByResource("groups")).toEqual([
        "groups:create",
        "groups:read",
        "groups:update",
        "groups:delete",
        "groups:assign-member",
      ]);
      expect(
        permissionsFromObject({ groups: ["read", "delete"] }),
      ).toEqual(["groups:read", "groups:delete"]);
    });
  });
});
