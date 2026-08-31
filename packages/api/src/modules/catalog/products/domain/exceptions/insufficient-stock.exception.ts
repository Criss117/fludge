import { ORPCError } from "@orpc/server";

export class InsufficientStockException extends ORPCError<"BAD_REQUEST", void> {
  constructor(message = "Stock insuficiente") {
    super("BAD_REQUEST", { message });
  }
}
