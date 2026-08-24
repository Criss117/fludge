import { ORPCError } from "@orpc/server";

export class GroupMemberNotFoundException extends ORPCError<"NOT_FOUND", void> {
  constructor(message = "El grupo no tiene miembros asignados") {
    super("NOT_FOUND", {
      message,
    });
  }
}
