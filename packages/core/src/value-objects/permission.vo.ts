export const resources = [
  "users",
  "tickets",
  "products",
  "clients",
  "businesses",
  "groups",
] as const;
export const actions = ["create", "read", "update", "delete"] as const;

export type Resouce = (typeof resources)[number];
export type Action = (typeof actions)[number];

export type Permission = `${Resouce}:${Action}`;

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
  "businesses:read",
  "businesses:update",

  "groups:create",
  "groups:read",
  "groups:update",
  "groups:delete",
];
