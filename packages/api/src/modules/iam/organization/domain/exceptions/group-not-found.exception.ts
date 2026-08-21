import { ORPCError } from "@orpc/server";

export class GroupNotFoundException extends ORPCError<"NOT_FOUND", void> {
  constructor(message = "El grupo no existe") {
    super("NOT_FOUND", {
      message,
    });
  }
}
