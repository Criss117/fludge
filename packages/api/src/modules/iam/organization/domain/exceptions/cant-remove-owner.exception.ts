import { ORPCError } from "@orpc/server";

export class CantRemoveOwnerException extends ORPCError<"BAD_REQUEST", void> {
  constructor(message = "No se puede eliminar el propietario") {
    super("BAD_REQUEST", { message });
  }
}
