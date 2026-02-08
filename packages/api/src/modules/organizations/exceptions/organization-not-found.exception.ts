import { ORPCError } from "@orpc/client";

export class OrganizationNotFoundException extends ORPCError<
  "NOT_FOUND",
  undefined
> {
  constructor(message = "Organization not found") {
    super("NOT_FOUND", {
      message,
    });
  }
}
