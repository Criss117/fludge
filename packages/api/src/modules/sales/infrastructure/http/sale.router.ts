import { hasPermissionProcedure } from "@fludge/api/index";
import { createSaleCommand } from "@fludge/api/modules/sales/application/commands/create-sale.command";
import { saleContainer } from "@fludge/api/modules/sales/container";

const TAGS = ["Sales"];

export const salesRouter = {
  commands: {
    create: hasPermissionProcedure({
      sales: ["create"],
    })
      .route({
        path: "/sales",
        method: "POST",
        tags: TAGS,
      })
      .input(createSaleCommand)
      .handler(({ context, input }) =>
        saleContainer.commands.createSaleCommand.execute(
          context.session.activeOrganization,
          context.session.userId,
          input,
        ),
      ),
  },
  queries: {
    findAll: hasPermissionProcedure({
      sales: ["read"],
    })
      .route({
        path: "/sales",
        method: "GET",
        tags: TAGS,
      })
      .handler(({ context }) =>
        saleContainer.queries.findAllSalesQuery.execute(
          context.session.activeOrganization,
        ),
      ),
  },
};
