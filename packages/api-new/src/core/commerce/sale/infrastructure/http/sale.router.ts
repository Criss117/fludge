import { hasPermissionProcedure } from "@fludge/api/index";
import { createSaleCommand } from "@core/commerce/sale/application/commands/create-sale.command";
import { cancelSaleCommand } from "@core/commerce/sale/application/commands/cancel-sale.command";
import { refundSaleItemsCommand } from "@core/commerce/sale/application/commands/refund-sale-items.command";
import { commerceContainer } from "@core/commerce/container";

const TAGS = ["Sales"] as const;

export const saleRouter = {
  commands: {
    create: hasPermissionProcedure({
      sales: ["create"],
    })
      .route({
        method: "POST",
        path: "/sales",
        tags: TAGS,
      })
      .input(createSaleCommand)
      .handler(({ input, context }) =>
        commerceContainer.commands.sale.create.execute(
          context.session.authContext,
          input,
        ),
      ),

    cancel: hasPermissionProcedure({
      sales: ["update"],
    })
      .route({
        method: "PUT",
        path: "/sales/cancel",
        tags: TAGS,
      })
      .input(cancelSaleCommand)
      .handler(({ input, context }) =>
        commerceContainer.commands.sale.cancel.execute(
          context.session.authContext,
          input,
        ),
      ),

    refundItems: hasPermissionProcedure({
      sales: ["update"],
    })
      .route({
        method: "PUT",
        path: "/sales/refund-items",
        tags: TAGS,
      })
      .input(refundSaleItemsCommand)
      .handler(({ input, context }) =>
        commerceContainer.commands.sale.refundItems.execute(
          context.session.authContext,
          input,
        ),
      ),
  },
};
