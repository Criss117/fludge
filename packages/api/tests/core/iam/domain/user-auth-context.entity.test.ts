import { describe, expect, it } from "bun:test";

import type { PermissionsRecord } from "@fludge/utils/permissions/data";
import { Permissions } from "@fludge/utils/permissions/index";
import { UUID } from "@fludge/utils/uuid";

import { Group } from "../../../../src/core/iam/domain/entities/group.entity";
import { Member } from "../../../../src/core/iam/domain/entities/member.entity";
import { UserAuthContext } from "../../../../src/core/iam/domain/entities/user-auth-context.entity";

const ORGANIZATION_ID = UUID.fromString(
  "0192d840-7c3f-73b2-8f71-2c1b6a9e5d10",
);
const USER_ID = UUID.fromString("0192d840-7c3f-73b2-8f71-2c1b6a9e5d11");
const CREATED_BY = UUID.fromString("0192d840-7c3f-73b2-8f71-2c1b6a9e5d12");

let groupCounter = 0;

function createMember(role: "owner" | "member" = "member") {
  return Member.create({
    userId: USER_ID,
    assignedBy: null,
    role,
    organizationId: ORGANIZATION_ID,
  });
}

function createGroup(
  permissions: PermissionsRecord,
  status: "active" | "inactive" = "active",
) {
  groupCounter += 1;
  const group = Group.create({
    name: `Group ${groupCounter}`,
    permissions: Permissions.fromRecord(permissions),
    createdBy: CREATED_BY,
    organizationId: ORGANIZATION_ID,
  });

  if (status === "inactive") {
    group.setInactive();
  }

  return group;
}

function createContext(options: {
  member?: Member;
  groups?: Group[];
}) {
  return UserAuthContext.create({
    organizationId: ORGANIZATION_ID,
    member: options.member ?? createMember(),
    groups: options.groups ?? [],
  });
}

const CATEGORIES_READ: PermissionsRecord = { categories: ["read"] };
const PRODUCTS_CREATE: PermissionsRecord = { products: ["create"] };
const SALES_READ: PermissionsRecord = { sales: ["read"] };

describe("UserAuthContext", () => {
  describe("create / getters", () => {
    it("preserves the organizationId, member and groups", () => {
      const member = createMember();
      const groups = [createGroup(CATEGORIES_READ)];

      const context = UserAuthContext.create({
        organizationId: ORGANIZATION_ID,
        member,
        groups,
      });

      expect(context.organizationId).toBe(ORGANIZATION_ID);
      expect(context.member).toBe(member);
      expect(context.groups).toBe(groups);
    });

    it("returns the same instances through the getters", () => {
      const member = createMember();
      const groups = [createGroup(CATEGORIES_READ)];
      const context = createContext({ member, groups });

      expect(context.organizationId).toBe(ORGANIZATION_ID);
      expect(context.member).toBe(member);
      expect(context.groups).toEqual(groups);
    });
  });

  describe("hasPermission", () => {
    it("returns true for an owner member without checking groups", () => {
      const owner = createMember("owner");
      const context = createContext({ member: owner });

      expect(context.hasPermission({ products: ["delete"] })).toBe(true);
    });

    it("returns true for an owner member even with empty groups", () => {
      const owner = createMember("owner");
      const context = createContext({ member: owner, groups: [] });

      expect(
        context.hasPermission(
          { categories: ["read"], products: ["create"], sales: ["delete"] },
          "any",
        ),
      ).toBe(true);
    });

    it("returns true when an active group has the required permission (mode all)", () => {
      const context = createContext({
        groups: [createGroup(CATEGORIES_READ)],
      });

      expect(context.hasPermission({ categories: ["read"] })).toBe(true);
    });

    it("returns true when all required permissions come from active groups (mode all)", () => {
      const context = createContext({
        groups: [
          createGroup(CATEGORIES_READ),
          createGroup(PRODUCTS_CREATE),
        ],
      });

      expect(
        context.hasPermission(
          { categories: ["read"], products: ["create"] },
          "all",
        ),
      ).toBe(true);
    });

    it("returns false when only part of the required permissions are present (mode all)", () => {
      const context = createContext({
        groups: [createGroup(CATEGORIES_READ)],
      });

      expect(
        context.hasPermission(
          { categories: ["read"], products: ["create"] },
          "all",
        ),
      ).toBe(false);
    });

    it("returns true when any active group has any required permission (mode any)", () => {
      const context = createContext({
        groups: [createGroup(CATEGORIES_READ), createGroup(PRODUCTS_CREATE)],
      });

      expect(
        context.hasPermission(
          { categories: ["read"], products: ["delete"] },
          "any",
        ),
      ).toBe(true);
    });

    it("returns true when the permission comes from a single group (mode any)", () => {
      const context = createContext({
        groups: [createGroup(SALES_READ)],
      });

      expect(
        context.hasPermission(
          { categories: ["read"], products: ["create"], sales: ["read"] },
          "any",
        ),
      ).toBe(true);
    });

    it("returns false when no active group has the required permission", () => {
      const context = createContext({
        groups: [createGroup(CATEGORIES_READ)],
      });

      expect(context.hasPermission(PRODUCTS_CREATE)).toBe(false);
    });

    it("returns false when the only matching group is inactive", () => {
      const context = createContext({
        groups: [createGroup(CATEGORIES_READ, "inactive")],
      });

      expect(context.hasPermission({ categories: ["read"] })).toBe(false);
    });

    it("checks active groups only", () => {
      const context = createContext({
        groups: [
          createGroup(CATEGORIES_READ),
          createGroup(PRODUCTS_CREATE, "inactive"),
        ],
      });

      expect(context.hasPermission({ categories: ["read"] })).toBe(true);
      expect(context.hasPermission({ products: ["create"] })).toBe(false);
    });

    it("returns false for a non-owner with empty groups", () => {
      const context = createContext({ groups: [] });

      expect(context.hasPermission({ categories: ["read"] })).toBe(false);
    });

    it("returns false when every group is inactive", () => {
      const context = createContext({
        groups: [
          createGroup(CATEGORIES_READ, "inactive"),
          createGroup(PRODUCTS_CREATE, "inactive"),
        ],
      });

      expect(
        context.hasPermission({ categories: ["read"] }, "any"),
      ).toBe(false);
    });
  });
});