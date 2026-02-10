import { ORPCError } from "@orpc/client";

export class InternalServerErrorException extends ORPCError<
  "INTERNAL_SERVER_ERROR",
  undefined
> {
  constructor(message = "Algo salió mal") {
    super("INTERNAL_SERVER_ERROR", { message });
  }
}
