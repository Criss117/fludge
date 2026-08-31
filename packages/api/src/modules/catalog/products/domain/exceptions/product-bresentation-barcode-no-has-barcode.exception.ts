import { ORPCError } from "@orpc/server";

export class ProductPresentationNoHasBarcodeException extends ORPCError<
  "BAD_REQUEST",
  void
> {
  constructor(message = "Debe de tener al menos una presentación con barcode") {
    super("BAD_REQUEST", { message });
  }
}
