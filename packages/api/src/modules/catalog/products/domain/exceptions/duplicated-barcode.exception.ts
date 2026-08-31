import { ORPCError } from "@orpc/server";

export class DuplicatedBarcodeException extends ORPCError<"BAD_REQUEST", void> {
  constructor(message = "El barcode ya existe") {
    super("BAD_REQUEST", { message });
  }
}
