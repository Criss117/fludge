import { ORPCError } from "@orpc/server";

export class CategoryIsChildException extends ORPCError<"BAD_REQUEST", void> {
  constructor(message = "La categoría es hija de otra") {
    super("BAD_REQUEST", { message });
  }
}
