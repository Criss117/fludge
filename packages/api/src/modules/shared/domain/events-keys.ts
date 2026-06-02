export const EVENTS_KEYS = {
  ORGANIZATION: {
    REGISTERED: "organization:registered",
  },
} as const;

type DeepLeafValues<T> = T extends string
  ? T
  : { [K in keyof T]: DeepLeafValues<T[K]> }[keyof T];

export type EVENTS_KEYS_TYPE = DeepLeafValues<typeof EVENTS_KEYS>;
