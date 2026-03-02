import { ORPCError } from "@orpc/client";

export class ProductNotFoundException extends ORPCError<"NOT_FOUND", unknown> {
  constructor(message = "Producto no encontrado") {
    super("NOT_FOUND", { message });
  }
}
