import { ORPCError } from "@orpc/client";

export class UserAlreadyExistsException extends ORPCError<
  "CONFLICT",
  undefined
> {
  constructor(message = "El usuario ya existe") {
    super("CONFLICT", {
      message,
    });
  }
}
