import type { RouterClient } from "@orpc/server";

import { publicProcedure } from "..";
import { organizationRouter } from "@fludge/api/modules/iam/organization/infrastructure/http/organization.router";
import { authRouter } from "@fludge/api/modules/iam/auth/infrastructure/http/auth.router";
import { groupRouter } from "@fludge/api/modules/iam/organization/infrastructure/http/group.router";
import { memberRouter } from "@fludge/api/modules/iam/organization/infrastructure/http/member.router";
import { categoryRouter } from "@fludge/api/modules/catalog/categories/infrastructure/http/category.router";
import { productsRouter } from "@fludge/api/modules/catalog/products/infrastructure/http/products.router";
import { salesRouter } from "@fludge/api/modules/sales/infrastructure/http/sale.router";
import { seedRouter } from "@fludge/api/modules/seed/seed.router";

export const appRouter = {
  organization: organizationRouter,
  group: groupRouter,
  auth: authRouter,
  member: memberRouter,
  category: categoryRouter,
  product: productsRouter,
  sale: salesRouter,
  seed: seedRouter,

  ping: publicProcedure.handler(() => {
    return {
      message: "pong",
    };
  }),
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
