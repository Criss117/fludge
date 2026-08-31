import { ORPCError } from "@orpc/server";

export class InvalidAmountException extends ORPCError<"BAD_REQUEST", void> {
  constructor(message = "Monto no valido") {
    super("BAD_REQUEST", { message });
  }
}
