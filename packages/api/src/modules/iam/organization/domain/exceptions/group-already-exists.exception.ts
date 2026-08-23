import { ORPCError } from "@orpc/server";

export class GroupAlreadyExistsException extends ORPCError<"CONFLICT", void> {
  constructor(message = "El grupo ya existe") {
    super("CONFLICT", { message });
  }
}
