import { ORPCError } from "@orpc/client";

export class ProductAlreadyExistsException extends ORPCError<
  "CONFLICT",
  unknown
> {
  constructor(message = "El producto ya existe") {
    super("CONFLICT", {
      message,
    });
  }
}
