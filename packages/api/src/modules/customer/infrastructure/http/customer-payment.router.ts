import { hasPermissionProcedure } from "@fludge/api/index";
import { customerContainer } from "@fludge/api/modules/customer/container";
import { createCustomerPaymentCommand } from "@fludge/api/modules/customer/application/commands/create-customer-payment.command";
import { cancelCustomerPaymentCommand } from "@fludge/api/modules/customer/application/commands/cancel-customer-payment.command";

const TAGS = ["Customer Payments"];

export const customerPaymentRouter = {
  commands: {
    record: hasPermissionProcedure({
      customers: ["update"],
    })
      .route({
        path: "/customers/payments",
        method: "POST",
        tags: TAGS,
      })
      .input(createCustomerPaymentCommand)
      .handler(({ context, input }) =>
        customerContainer.commands.createCustomerPaymentCommand.execute(
          context.session.activeOrganization,
          context.session.userId,
          input,
        ),
      ),

    cancel: hasPermissionProcedure({
      customers: ["update"],
    })
      .route({
        path: "/customers/payments/cancel",
        method: "POST",
        tags: TAGS,
      })
      .input(cancelCustomerPaymentCommand)
      .handler(({ context, input }) =>
        customerContainer.commands.cancelCustomerPaymentCommand.execute(
          context.session.activeOrganization,
          input,
        ),
      ),
  },
};
