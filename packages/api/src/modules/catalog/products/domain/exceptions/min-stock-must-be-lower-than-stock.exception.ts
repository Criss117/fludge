import { ORPCError } from "@orpc/server";
export class MinStockMustBeLowerThanStockException extends ORPCError<
  "BAD_REQUEST",
  void
> {
  constructor(message = "Product min stock must be lower than stock") {
    super("BAD_REQUEST", { message });
  }
}
