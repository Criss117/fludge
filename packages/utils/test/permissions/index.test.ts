import { describe, test, expect } from "bun:test";
import {
  preparePermissions,
  hasAllPermissions,
  hasAnyPermission,
  checkPermissions,
  ALL_PERMISSIONS,
  getPermissionDescription,
  getPermissionByResource,
} from "@fludge/utils/permissions/index";
import { PERMISSIONS } from "@fludge/utils/permissions/data";

// ─── preparePermissions ───────────────────────────────────────────────────────

describe("preparePermissions", () => {
  test("adds the implicit <resource>:view for each resource present", () => {
    const result = preparePermissions(["groups:create"]);

    expect(result).toContain("groups:create");
    expect(result).toContain("groups:view");
  });

  test("does not duplicate when <resource>:view is already present", () => {
    const result = preparePermissions(["groups:view"]);

    expect(result).toEqual(["groups:view"]);
  });

  test("adds a view permission per distinct resource", () => {
    const result = preparePermissions(["groups:create", "members:create"]);

    expect(result).toContain("groups:view");
    expect(result).toContain("members:view");
    expect(result).toContain("groups:create");
    expect(result).toContain("members:create");
    expect(result).toHaveLength(4);
  });

  test("deduplicates identical permissions", () => {
    const result = preparePermissions([
      "groups:create",
      "groups:create",
      "groups:view",
    ]);

    expect(result).toEqual(["groups:create", "groups:view"]);
  });
});

// ─── hasAllPermissions ───────────────────────────────────────────────────────

describe("hasAllPermissions", () => {
  test("returns true when the user holds the single required permission", () => {
    expect(hasAllPermissions(["groups:view"], "groups:view")).toBe(true);
  });

  test("returns false when the user lacks the single required permission", () => {
    expect(hasAllPermissions(["groups:view"], "groups:create")).toBe(false);
  });

  test("returns true when the user holds every required permission in the array", () => {
    expect(
      hasAllPermissions(["groups:view", "groups:create"], [
        "groups:view",
        "groups:create",
      ]),
    ).toBe(true);
  });

  test("returns false when the user is missing at least one required permission", () => {
    expect(
      hasAllPermissions(["groups:view"], ["groups:view", "groups:create"]),
    ).toBe(false);
  });
});

// ─── hasAnyPermission ─────────────────────────────────────────────────────────

describe("hasAnyPermission", () => {
  test("returns true when the user holds the single permission", () => {
    expect(hasAnyPermission(["groups:view"], "groups:view")).toBe(true);
  });

  test("returns true when the user holds at least one of the required array", () => {
    expect(
      hasAnyPermission(["groups:view"], ["groups:create", "groups:view"]),
    ).toBe(true);
  });

  test("returns false when the user holds none of the required array", () => {
    expect(
      hasAnyPermission(["groups:view"], ["groups:create", "groups:delete"]),
    ).toBe(false);
  });
});

// ─── checkPermissions ────────────────────────────────────────────────────────

describe("checkPermissions", () => {
  test("delegates to hasAllPermissions in 'all' mode", () => {
    expect(
      checkPermissions(
        ["groups:view", "groups:create"],
        ["groups:view", "groups:create"],
        "all",
      ),
    ).toBe(true);

    expect(
      checkPermissions(["groups:view"], ["groups:view", "groups:create"], "all"),
    ).toBe(false);
  });

  test("delegates to hasAnyPermission in 'any' mode", () => {
    expect(
      checkPermissions(["groups:view"], ["groups:view", "groups:create"], "any"),
    ).toBe(true);

    expect(
      checkPermissions(["groups:view"], ["groups:create", "groups:delete"], "any"),
    ).toBe(false);
  });

  test("defaults to 'all' mode when mode is omitted", () => {
    expect(checkPermissions(["groups:view"], "groups:view")).toBe(true);
    expect(checkPermissions(["groups:view"], "groups:create")).toBe(false);
  });
});

// ─── ALL_PERMISSIONS ──────────────────────────────────────────────────────────

describe("ALL_PERMISSIONS", () => {
  test("contains every resource:action pair from PERMISSIONS", () => {
    const expected = (
      ["groups", "members", "categories", "products"] as const
    ).flatMap((resource) =>
      Object.values(PERMISSIONS[resource]).map(
        (action) => `${resource}:${action}`,
      ),
    );

    expect(ALL_PERMISSIONS).toEqual(expected);
  });

  test("has 16 permissions total", () => {
    expect(ALL_PERMISSIONS).toHaveLength(16);
  });

  test("every entry is unique", () => {
    expect(new Set(ALL_PERMISSIONS).size).toBe(ALL_PERMISSIONS.length);
  });
});

// ─── getPermissionDescription ─────────────────────────────────────────────────

describe("getPermissionDescription", () => {
  test("returns the stored title, description, and target for a known action", () => {
    const result = getPermissionDescription("groups:view");

    expect(result).toEqual({
      title: "Ver grupos",
      description:
        "Permite visualizar el listado de grupos y acceder a sus detalles básicos.",
      target: "Grupos",
    });
  });

  test("resolves camelCase action keys from hyphenated permission strings", () => {
    // "assign-member" maps to the PERMISSION_DESCRIPTIONS.groups.assignMember key
    const result = getPermissionDescription("groups:assign-member");

    expect(result.title).toBe("Asignar miembros a grupos");
    expect(result.target).toBe("Grupos");
  });

  test("returns a fallback object for an action without a description", () => {
    // No description entry exists for a fabricated action; the type is
    // constrained, so we cast to exercise the runtime fallback branch.
    const result = getPermissionDescription(
      "groups:nonexistent" as unknown as "groups:view",
    );

    expect(result).toEqual({
      title: "nonexistent",
      description: "No description available",
      target: "Grupos",
    });
  });
});

// ─── getPermissionByResource ─────────────────────────────────────────────────

describe("getPermissionByResource", () => {
  test("returns all <resource>:<action> pairs for the given resource", () => {
    expect(getPermissionByResource("groups")).toEqual([
      "groups:view",
      "groups:create",
      "groups:delete",
      "groups:assign-member",
      "groups:update",
    ]);
  });

  test("returns fewer pairs for members (no assignMember/assignGroup overlap)", () => {
    expect(getPermissionByResource("members")).toEqual([
      "members:view",
      "members:create",
      "members:assign-group",
    ]);
  });
});