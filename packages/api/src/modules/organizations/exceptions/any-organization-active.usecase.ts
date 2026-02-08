import { ORPCError } from "@orpc/client";

export class AnyOrganizationActiveUseCase extends ORPCError<
  "BAD_REQUEST",
  undefined
> {
  constructor(message = "Ninguna Organización activa") {
    super("BAD_REQUEST", {
      message,
    });
  }
}
