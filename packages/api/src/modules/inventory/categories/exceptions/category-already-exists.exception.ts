import { ORPCError } from "@orpc/client";

export class CategoryAlreadyExistsException extends ORPCError<
  "CONFLICT",
  unknown
> {
  constructor(message = "Categoría ya existe") {
    super("CONFLICT", { message });
  }
}
