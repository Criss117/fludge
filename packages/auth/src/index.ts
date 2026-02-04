import { expo } from "@better-auth/expo";
import { db } from "@fludge/db";
import * as schema from "@fludge/db/schema/auth";
import { env } from "@fludge/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization, username } from "better-auth/plugins";
import { permissionsSchema } from "./permissions";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",

    schema: schema,
  }),
  trustedOrigins: [
    env.CORS_ORIGIN,
    "fludge://",
    ...(env.NODE_ENV === "development"
      ? [
          "exp://",
          "exp://**",
          "exp://192.168.*.*:*/**",
          "http://localhost:8081",
        ]
      : []),
  ],
  emailAndPassword: {
    enabled: true,
  },
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
        fieldName: "is_root",
        required: true,
      },
    },
  },
  plugins: [
    expo(),
    organization({
      teams: {
        enabled: true,
        allowRemovingAllTeams: true,
        defaultTeam: {
          enabled: false,
        },
      },
      schema: {
        organization: {
          additionalFields: {
            legalName: {
              type: "string",
              fieldName: "legal_name",
              required: true,
              unique: true,
            },
            address: {
              type: "string",
              fieldName: "address",
              required: true,
            },
            contactPhone: {
              type: "string",
              fieldName: "contact_phone",
            },
            contactEmail: {
              type: "string",
              fieldName: "contact_email",
            },
          },
        },
        team: {
          additionalFields: {
            permissions: {
              type: "json",
              fieldName: "permissions",
              required: true,
              validator: {
                input: permissionsSchema,
                output: permissionsSchema,
              },
            },
          },
        },
      },
    }),
    username(),
  ],
});
