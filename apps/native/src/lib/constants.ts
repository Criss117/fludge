import { Platform } from "expo";

export const TICKETS_LOCAL_STORAGE_KEY = "tickets";
export const SESSION_LOCAL_STORAGE_KEY = "session";
export const ORGANIZATION_LOCAL_STORAGE_KEY = "organization";

export const isPlatform = {
  isAndroid: Platform.OS === "android",
  isIos: Platform.OS === "ios",
} as const;
