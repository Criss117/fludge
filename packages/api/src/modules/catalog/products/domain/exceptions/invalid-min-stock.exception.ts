import { ORPCError } from "@orpc/server";

export class InvalidMinStockException extends ORPCError<"BAD_REQUEST", void> {
  constructor(message = "El stock mínimo no puede ser negativo") {
    super("BAD_REQUEST", { message });
  }
}
