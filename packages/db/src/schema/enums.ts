export const historyActionEnum = ["update", "activate", "deactivate"] as const;
export const statusEnum = ["active", "inactive"] as const;
export const roleEnum = ["owner", "member"] as const;

export type HistoryActionEnum = (typeof historyActionEnum)[number];
export type StatusEnum = (typeof statusEnum)[number];
export type RoleEnum = (typeof roleEnum)[number];
