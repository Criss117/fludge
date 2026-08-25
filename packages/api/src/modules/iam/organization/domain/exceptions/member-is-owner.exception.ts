import { ORPCError } from "@orpc/server";

export class MemberIsOwnerException extends ORPCError<"BAD_REQUEST", void> {
  constructor(message = "El miembro es el propietario de la organización") {
    super("BAD_REQUEST", {
      message,
    });
  }
}
