import type { RouterClient } from "@orpc/server";

import { publicProcedure } from "..";
import { authRouter } from "@core/auth/infrastructure/http/auth.router";
import { organizationRouter } from "@core/iam/infrastructure/http/organization.router";
import { groupRouter } from "@core/iam/infrastructure/http/group.router";
import { memberRouter } from "@core/iam/infrastructure/http/member.router";
import { categoryRouter } from "@core/catalog/categories/infrastructure/http/category.router";
import { productsRouter } from "@core/catalog/products/infrastructure/http/products.router";
import { saleRouter } from "@core/commerce/sale/infrastructure/http/sale.router";
import { customerRouter } from "@core/commerce/customer/infrastructure/http/customer.router";

export const appRouter = {
  auth: authRouter,
  organization: organizationRouter,
  group: groupRouter,
  member: memberRouter,
  category: categoryRouter,
  product: productsRouter,
  sale: saleRouter,
  customer: customerRouter,

  ping: publicProcedure.handler(({ context }) => {
    return context;
  }),
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
