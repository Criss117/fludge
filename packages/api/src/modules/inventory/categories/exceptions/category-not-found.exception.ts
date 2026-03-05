import { ORPCError } from "@orpc/client";

export class CategoryNotFoundException extends ORPCError<"NOT_FOUND", unknown> {
  constructor(message = "Categoría no encontrada") {
    super("NOT_FOUND", { message });
  }
}
