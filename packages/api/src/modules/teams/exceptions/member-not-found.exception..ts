import { ORPCError } from "@orpc/client";

export class MemberNotFoundException extends ORPCError<"NOT_FOUND", undefined> {
  constructor(message = "El miembro no fue encontrado") {
    super("NOT_FOUND", { message });
  }
}
