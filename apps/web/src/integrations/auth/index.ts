import { env } from "@fludge/env/web";
import { createAuthClient } from "better-auth/react";
import {
  organizationClient,
  usernameClient,
  inferOrgAdditionalFields,
} from "better-auth/client/plugins";
import type { auth } from "@fludge/auth";

export const authClient = createAuthClient({
  baseURL: env.VITE_SERVER_URL,
  plugins: [
    usernameClient(),
    organizationClient({
      schema: inferOrgAdditionalFields<typeof auth>(),
      teams: {
        enabled: true,
      },
    }),
  ],
});
