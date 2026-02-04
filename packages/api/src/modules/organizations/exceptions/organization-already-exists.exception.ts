import { ORPCError } from "@orpc/client";

export class OrganizationAlreadyExistsException extends ORPCError<
  "CONFLICT",
  undefined
> {
  constructor(message = "La organización ya existe") {
    super("CONFLICT", { message });
  }
}
