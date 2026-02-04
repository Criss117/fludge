import { ORPCError } from "@orpc/client";

export class OrganizationNotFoundException extends ORPCError<
  "CONFLICT",
  undefined
> {
  constructor(message = "Organization not found") {
    super("CONFLICT", {
      message,
    });
  }
}
