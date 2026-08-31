import { ORPCError } from "@orpc/server";

export class CategoryNotFoundException extends ORPCError<"NOT_FOUND", void> {
  constructor(message = "La categoría no existe") {
    super("NOT_FOUND", { message });
  }
}
