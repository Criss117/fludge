import { describe, test, expect } from "bun:test";
import {
  ALL_RESOURCES,
  ES_RESOURCES,
  PERMISSIONS,
  PERMISSION_DESCRIPTIONS,
  RESOURCE_DESCRIPTIONS,
} from "@fludge/utils/permissions/data";

describe("ALL_RESOURCES", () => {
  test("contains the four resources in declaration order", () => {
    expect(ALL_RESOURCES).toEqual([
      "groups",
      "members",
      "categories",
      "products",
    ]);
  });
});

describe("ES_RESOURCES", () => {
  test("maps every resource to its Spanish display name", () => {
    expect(ES_RESOURCES).toEqual({
      groups: "Grupos",
      members: "Miembros",
      categories: "Categorías",
      products: "Productos",
    });
  });
});

describe("PERMISSIONS", () => {
  test("defines actions for every resource in ALL_RESOURCES", () => {
    for (const resource of ALL_RESOURCES) {
      expect(PERMISSIONS[resource]).toBeDefined();
    }
  });

  test("groups has view, create, delete, assignMember, update actions", () => {
    expect(PERMISSIONS.groups).toEqual({
      view: "view",
      create: "create",
      delete: "delete",
      assignMember: "assign-member",
      update: "update",
    });
  });

  test("members has view, create, assignGroup actions", () => {
    expect(PERMISSIONS.members).toEqual({
      view: "view",
      create: "create",
      assignGroup: "assign-group",
    });
  });

  test("categories and products share the same action set", () => {
    expect(PERMISSIONS.categories).toEqual({
      view: "view",
      create: "create",
      update: "update",
      delete: "delete",
    });
    expect(PERMISSIONS.products).toEqual(PERMISSIONS.categories);
  });
});

describe("PERMISSION_DESCRIPTIONS", () => {
  test("provides a title and description for every action of every resource", () => {
    for (const resource of ALL_RESOURCES) {
      const actions = PERMISSIONS[resource];
      const descs = PERMISSION_DESCRIPTIONS[resource];

      for (const [actionKey, actionValue] of Object.entries(actions)) {
        expect(
          descs[actionKey as keyof typeof descs],
          `${resource}.${actionKey} (${actionValue}) missing description`,
        ).toBeDefined();
        expect(
          descs[actionKey as keyof typeof descs].title,
        ).toBeTypeOf("string");
        expect(
          descs[actionKey as keyof typeof descs].description,
        ).toBeTypeOf("string");
      }
    }
  });

  test("groups.view description matches the known copy", () => {
    expect(PERMISSION_DESCRIPTIONS.groups.view).toEqual({
      title: "Ver grupos",
      description:
        "Permite visualizar el listado de grupos y acceder a sus detalles básicos.",
    });
  });
});

describe("RESOURCE_DESCRIPTIONS", () => {
  test("mirrors ES_RESOURCES display names", () => {
    expect(RESOURCE_DESCRIPTIONS).toEqual(ES_RESOURCES);
  });
});