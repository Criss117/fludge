import { env } from "@fludge/env/web";
import { createAuthClient } from "better-auth/react";
import {
  inferAdditionalFields,
  organizationClient,
} from "better-auth/client/plugins";
import type { auth } from "@fludge/auth";

export const authClient = createAuthClient({
  baseURL: env.VITE_SERVER_URL,
  plugins: [organizationClient(), inferAdditionalFields<typeof auth>()],
});
