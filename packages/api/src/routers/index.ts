import type { RouterClient } from "@orpc/server";

import { publicProcedure } from "..";
import { authRouter } from "@fludge/api/core/auth/infrastructure/http/auth.router";
import { organizationRouter } from "@fludge/api/core/iam/infrastructure/http/organization.router";
import { groupRouter } from "@fludge/api/core/iam/infrastructure/http/group.router";
import { memberRouter } from "@fludge/api/core/iam/infrastructure/http/member.router";
import { categoryRouter } from "@fludge/api/core/catalog/categories/infrastructure/http/category.router";
import { productsRouter } from "@fludge/api/core/catalog/products/infrastructure/http/products.router";
import { saleRouter } from "@fludge/api/core/commerce/sale/infrastructure/http/sale.router";
import { customerRouter } from "@fludge/api/core/commerce/customer/infrastructure/http/customer.router";
import { syncRouter } from "@fludge/api/core/sync/http/sync.router";
import { seedRouter } from "@fludge/api/core/seed/http/seed.router";

export const appRouter = {
  auth: authRouter,
  organization: organizationRouter,
  group: groupRouter,
  member: memberRouter,
  category: categoryRouter,
  product: productsRouter,
  sale: saleRouter,
  customer: customerRouter,

  sync: syncRouter,
  seed: seedRouter,

  ping: publicProcedure.handler(({ context }) => {
    return context;
  }),
} as const;

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
