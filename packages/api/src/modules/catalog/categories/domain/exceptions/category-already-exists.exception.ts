import { ORPCError } from "@orpc/server";

export class CategoryAlreadyExistsException extends ORPCError<
  "CONFLICT",
  void
> {
  constructor(message = "La categoría ya existe") {
    super("CONFLICT", { message });
  }
}
