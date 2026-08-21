import { ORPCError } from "@orpc/server";

export class MemberAlreadyExistsException extends ORPCError<"CONFLICT", void> {
  constructor(message = "El miembro ya existe") {
    super("CONFLICT", { message });
  }
}
