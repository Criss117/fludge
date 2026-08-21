import { ORPCError } from "@orpc/server";

export class MemberNotFoundException extends ORPCError<"NOT_FOUND", void> {
  constructor(message = "El miembro no existe") {
    super("NOT_FOUND", {
      message,
    });
  }
}
