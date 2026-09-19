import { hasPermissionProcedure } from "@fludge/api/index";
import { createCustomerCommand } from "@fludge/api/modules/customer/application/commands/create-customer.command";
import { updateCustomerCommand } from "@fludge/api/modules/customer/application/commands/update-customer.command";
import { customerContainer } from "@fludge/api/modules/customer/container";

const TAGS = ["Customers"];

export const customerRouter = {
  commands: {
    create: hasPermissionProcedure({
      customers: ["create"],
    })
      .route({
        path: "/customers",
        method: "POST",
        tags: TAGS,
      })
      .input(createCustomerCommand)
      .handler(({ context, input }) =>
        customerContainer.commands.createCustomerCommand.execute(
          context.session.activeOrganization,
          context.session.userId,
          input,
        ),
      ),

    update: hasPermissionProcedure({
      customers: ["update"],
    })
      .route({
        path: "/customers",
        method: "PUT",
        tags: TAGS,
      })
      .input(updateCustomerCommand)
      .handler(({ context, input }) =>
        customerContainer.commands.updateCustomerCommand.execute(
          context.session.activeOrganization,
          input,
        ),
      ),
  },
};
