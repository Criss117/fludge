import { ORPCError } from "@orpc/server";

export class StockMustBePositiveException extends ORPCError<
  "BAD_REQUEST",
  void
> {
  constructor(message = "El stock debe ser positivo") {
    super("BAD_REQUEST", { message });
  }
}
