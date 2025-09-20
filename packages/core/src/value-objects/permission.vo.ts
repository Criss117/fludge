export const resources = [
  "users",
  "tickets",
  "products",
  "clients",
  "businesses",
  "groups",
  "categories",
  "providers",
  "brands",
] as const;
export const actions = ["create", "read", "update", "delete"] as const;

export type Resource = (typeof resources)[number];
export type Action = (typeof actions)[number];

export type Permission = `${Resource}:${Action}`;

export const allPermissions: Permission[] = [
  "users:create",
  "users:read",
  "users:update",
  "users:delete",

  "tickets:create",
  "tickets:read",
  "tickets:update",
  "tickets:delete",

  "products:create",
  "products:read",
  "products:update",
  "products:delete",

  "clients:create",
  "clients:read",
  "clients:update",
  "clients:delete",

  "businesses:create",
  "businesses:update",

  "groups:create",
  "groups:read",
  "groups:update",
  "groups:delete",

  "categories:create",
  "categories:read",
  "categories:update",
  "categories:delete",

  "providers:create",
  "providers:read",
  "providers:update",
  "providers:delete",

  "brands:create",
  "brands:read",
  "brands:update",
  "brands:delete",
];
