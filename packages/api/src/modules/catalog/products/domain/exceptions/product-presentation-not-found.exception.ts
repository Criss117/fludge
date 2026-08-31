import { ORPCError } from "@orpc/server";

export class ProductPresentationNotFoundException extends ORPCError<
  "NOT_FOUND",
  void
> {
  constructor(message = "La presentación no existe") {
    super("NOT_FOUND", { message });
  }
}
