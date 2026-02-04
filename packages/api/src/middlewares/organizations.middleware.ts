import { auth } from "@fludge/auth";
import { requireAuthMiddleware } from "./requiere-auth.middleware";

export const organizationsMiddleware = requireAuthMiddleware().concat(
  async ({ context, next }, organizationId: string) => {
    const org = await auth.api.listOrganizations();

    return next({
      context,
    });
  },
);
