import { ORPCError } from "@orpc/client";

export class TeamAlreadyExistsException extends ORPCError<
  "CONFLICT",
  undefined
> {
  constructor(message = "El equipo ya existe") {
    super("CONFLICT", { message });
  }
}
