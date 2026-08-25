/**
 * Typed environment variables.
 * Uses Expo's EXPO_PUBLIC_* convention — inlined at build time by Metro.
 * ⚠️ Use dot notation only (process.env.EXPO_PUBLIC_FOO).
 * Destructuring or bracket access will NOT be inlined.
 */
export const env = {
  API_URL: process.env.EXPO_PUBLIC_API_URL as string,
  APP_NAME: process.env.EXPO_PUBLIC_APP_NAME as string,
} as const;
