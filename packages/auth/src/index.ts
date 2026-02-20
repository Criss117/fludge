import { organization, username } from "better-auth/plugins";
import { betterAuth } from "better-auth";
import { expo } from "@better-auth/expo";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@fludge/db";
import * as schema from "@fludge/db/schema/auth";
import { env } from "@fludge/env/server";
import { permissionsSchema } from "@fludge/utils/validators/permission.schemas";

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
      phone: {
        type: "string",
        fieldName: "phone",
        required: false,
      },
      cc: {
        type: "string",
        fieldName: "cc",
        required: true,
      },
      address: {
        type: "string",
        fieldName: "address",
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
              fieldName: "legalName",
              index: true,
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
              fieldName: "contactPhone",
              required: false,
            },
            contactEmail: {
              type: "string",
              fieldName: "contactEmail",
              required: false,
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
            description: {
              type: "string",
              fieldName: "description",
              required: false,
            },
          },
        },
      },
    }),
    username(),
  ],
});
