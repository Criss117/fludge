import { hasPermissionProcedure } from "@fludge/api/index";
import { createCustomerCommand } from "../../../../commerce/customer/application/commands/create-customer.command";
import { updateCustomerCommand } from "../../../../commerce/customer/application/commands/update-customer.command";
import { createCustomerPaymentCommand } from "../../../../commerce/customer/application/commands/create-customer-payment.command";
import { cancelCustomerPaymentCommand } from "../../../../commerce/customer/application/commands/cancel-customer-payment.command";
import { commerceContainer } from "../../../../commerce/container";

const TAGS = ["Customers"] as const;

export const customerRouter = {
  commands: {
    create: hasPermissionProcedure({
      customers: ["create"],
    })
      .route({
        method: "POST",
        path: "/customers",
        tags: TAGS,
      })
      .input(createCustomerCommand)
      .handler(({ input, context }) =>
        commerceContainer.commands.customer.create.execute(
          context.session.authContext,
          input,
        ),
      ),

    update: hasPermissionProcedure({
      customers: ["update"],
    })
      .route({
        method: "PUT",
        path: "/customers",
        tags: TAGS,
      })
      .input(updateCustomerCommand)
      .handler(({ input, context }) =>
        commerceContainer.commands.customer.update.execute(
          context.session.authContext,
          input,
        ),
      ),

    createPayment: hasPermissionProcedure({
      customers: ["update"],
    })
      .route({
        method: "POST",
        path: "/customers/payments",
        tags: TAGS,
      })
      .input(createCustomerPaymentCommand)
      .handler(({ input, context }) =>
        commerceContainer.commands.customer.createPayment.execute(
          context.session.authContext,
          input,
        ),
      ),

    cancelPayment: hasPermissionProcedure({
      customers: ["update"],
    })
      .route({
        method: "DELETE",
        path: "/customers/payments",
        tags: TAGS,
      })
      .input(cancelCustomerPaymentCommand)
      .handler(({ input, context }) =>
        commerceContainer.commands.customer.cancelPayment.execute(
          context.session.authContext,
          input,
        ),
      ),
  },
};
