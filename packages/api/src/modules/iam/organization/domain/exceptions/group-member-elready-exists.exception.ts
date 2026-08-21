import { ORPCError } from "@orpc/server";

export class GroupMemberAlreadyExistsException extends ORPCError<
  "CONFLICT",
  void
> {
  constructor() {
    super("CONFLICT", {
      message: "El miembro ya existe en el grupo",
    });
  }
}
