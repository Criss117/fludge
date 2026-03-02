import { ORPCError } from "@orpc/client";

export class UnauthorizedException extends ORPCError<"UNAUTHORIZED", unknown> {
  constructor(message = "No tienes permiso") {
    super("UNAUTHORIZED", { message });
  }
}
