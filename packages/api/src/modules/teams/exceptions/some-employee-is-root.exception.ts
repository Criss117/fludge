import { ORPCError } from "@orpc/client";

export class SomeEmployeeIsRootException extends ORPCError<
  "BAD_REQUEST",
  undefined
> {
  constructor(message = "Los usuarios root no pueden ser empleados") {
    super("BAD_REQUEST", {
      message,
    });
  }
}
