import { ORPCError } from "@orpc/server";

export class ProductPresentationAlreadyExistsException extends ORPCError<
  "CONFLICT",
  void
> {
  constructor(message = "La presentación ya existe") {
    super("CONFLICT", { message });
  }
}
