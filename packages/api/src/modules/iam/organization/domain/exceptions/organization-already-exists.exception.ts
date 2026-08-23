import { ORPCError } from "@orpc/server";

export class OrganizationAlreadyExistsException extends ORPCError<
  "CONFLICT",
  void
> {
  constructor(message = "La organización ya existe") {
    super("CONFLICT", { message });
  }
}
