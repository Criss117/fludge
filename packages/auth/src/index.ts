import { expo } from "@better-auth/expo";
import { databaseService } from "@fludge/db";
import * as schema from "@fludge/db/schema/index";
import { env } from "@fludge/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI } from "better-auth/plugins";

export const AVAILABLE_ENDPOINTS = [
  "/sign-out",
  "/sign-in/email",
  "/sign-up/email",
  "/get-session",
  "/reference",
] as const;

export function isAvailableEndpoint(endpoint: string) {
  return AVAILABLE_ENDPOINTS.some((e) => endpoint.includes(e));
}

export function createAuth() {
  return betterAuth({
    database: drizzleAdapter(databaseService, {
      provider: "sqlite",

      schema: schema,
    }),
    basePath: "/api/auth",
    trustedOrigins: [
      env.CORS_ORIGIN,
      "fludge://",
      "exp://",
      "http://localhost:8081",
    ],
    emailAndPassword: {
      enabled: true,
    },
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
    advanced: {
      defaultCookieAttributes: {
        sameSite: "none",
        secure: true,
        httpOnly: true,
      },
    },
    user: {
      additionalFields: {
        isRoot: {
          type: "boolean",
          required: true,
          returned: true,
        },
        phone: {
          type: "string",
          required: true,
          fieldName: "phone",
          returned: true,
        },
      },
    },
    session: {
      additionalFields: {
        activeOrganizationId: {
          type: "string",
          returned: true,
          required: false,
        },
      },
    },
    plugins: [expo(), openAPI()],
  });
}

export type AuthService = ReturnType<typeof createAuth>;

export const auth = createAuth();
