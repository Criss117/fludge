import { ORPCError } from "@orpc/server";

export class OwnerNotFoundException extends ORPCError<"NOT_FOUND", void> {
  constructor(message = "No se encontró el propietario") {
    super("NOT_FOUND", {
      message,
    });
  }
}
