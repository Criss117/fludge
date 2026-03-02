import { ORPCError } from "@orpc/client";

export class ForbiddenException extends ORPCError<"FORBIDDEN", unknown> {
  constructor(message = "No tienes acceso") {
    super("FORBIDDEN", { message });
  }
}
