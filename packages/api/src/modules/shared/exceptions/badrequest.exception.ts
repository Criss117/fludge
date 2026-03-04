import { ORPCError } from "@orpc/client";

export class BadRequestException extends ORPCError<"BAD_REQUEST", unknown> {
  constructor(message = "Hubo un error") {
    super("BAD_REQUEST", { message });
  }
}
