import { hasPermissionProcedure } from "@fludge/api/index";
import { customerContainer } from "@fludge/api/modules/customer/container";
import { createCustomerPaymentCommand } from "@fludge/api/modules/customer/application/commands/create-customer-payment.command";

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
          context.session.userId,
          context.session.activeOrganization,
          input,
        ),
      ),
  },
};
