import { expo } from "@better-auth/expo";
import { createDb } from "@fludge/db";
import * as schema from "@fludge/db/schemas/auth.schema";
import { env } from "@fludge/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI } from "better-auth/plugins";
import { organization } from "better-auth/plugins";

export const PUBLIC_ENDPOINTS = [
  "/sign-out",
  "/sign-in/email",
  "/get-session",
  "/reference",

  "/organization/get-full-organization",
];

export function createAuth() {
  const db = createDb();

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg",

      schema: schema,
    }),
    trustedOrigins: [
      env.CORS_ORIGIN,
      "fludge://",
      "exp://",
      "http://localhost:8081",
    ],
    emailAndPassword: {
      enabled: true,
    },
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
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
    plugins: [
      expo(),
      openAPI(),
      organization({
        allowUserToCreateOrganization: async (user) => {
          return user.isRoot;
        },

        schema: {
          organization: {
            additionalFields: {
              legalName: {
                type: "string",
                required: true,
                returned: true,
              },
              taxId: {
                type: "string",
                required: true,
                returned: true,
              },
              address: {
                type: "string",
                required: true,
                fieldName: "address",
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
          member: {
            additionalFields: {
              assignedBy: {
                type: "string",
                required: false,
                returned: true,
              },
            },
          },
        },
      }),
    ],
  });
}

export const auth = createAuth();
