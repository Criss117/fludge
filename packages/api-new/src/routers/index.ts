import type { RouterClient } from "@orpc/server";

import { publicProcedure } from "..";
import { authRouter } from "@core/auth/infrastructure/http/auth.router";
import { organizationRouter } from "@fludge/api/modules/iam/organization/infrastructure/http/organization.router";
import { groupRouter } from "@fludge/api/modules/iam/organization/infrastructure/http/group.router";
import { memberRouter } from "@fludge/api/modules/iam/organization/infrastructure/http/member.router";
import { categoryRouter } from "@fludge/api/modules/catalog/categories/infrastructure/http/category.router";
import { productsRouter } from "@fludge/api/modules/catalog/products/infrastructure/http/products.router";
import { salesRouter } from "@fludge/api/modules/sales/infrastructure/http/sale.router";
import { seedRouter } from "@fludge/api/modules/seed/seed.router";
import { syncRouter } from "../modules/sync/infrastructure/http/sync.router";
import { customerRouter } from "@fludge/api/modules/customer/infrastructure/http/customer.router";
import { customerPaymentRouter } from "@fludge/api/modules/customer/infrastructure/http/customer-payment.router";

export const appRouter = {
  auth: authRouter,
  organization: organizationRouter,
  group: groupRouter,
  member: memberRouter,
  category: categoryRouter,
  product: productsRouter,
  sale: salesRouter,
  customer: customerRouter,
  customerPayment: customerPaymentRouter,
  sync: syncRouter,
  seed: seedRouter,

  ping: publicProcedure.handler(({ context }) => {
    return context;
  }),
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
