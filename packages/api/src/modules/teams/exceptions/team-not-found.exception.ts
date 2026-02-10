import { ORPCError } from "@orpc/client";

export class TeamNotFoundException extends ORPCError<"NOT_FOUND", undefined> {
  constructor(message = "Equipo no encontrado") {
    super("NOT_FOUND", {
      message,
    });
  }
}
