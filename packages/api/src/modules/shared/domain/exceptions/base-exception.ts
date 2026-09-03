import type { TranslationKey } from "@fludge/i18n/index";
import type { ORPCErrorCode } from "@orpc/client";
import { ORPCError } from "@orpc/server";
import { getI18nKey } from "../../i18n/utils";

export class DomainException<T extends ORPCErrorCode> extends ORPCError<
  T,
  void
> {
  constructor(code: T, data: { message: TranslationKey; cause?: Error }) {
    super(code, data);
  }
}

export class InternalServerError extends DomainException<"INTERNAL_SERVER_ERROR"> {
  constructor(cause: Error, message?: TranslationKey) {
    super("INTERNAL_SERVER_ERROR", {
      message: getI18nKey(message ?? "api_errors.shared.internal_server_error"),
      cause,
    });
  }
}

export class NotFoundError extends DomainException<"NOT_FOUND"> {
  constructor(message: TranslationKey) {
    super("NOT_FOUND", { message });
  }
}

export class UnauthorizedError extends DomainException<"UNAUTHORIZED"> {
  constructor(message: TranslationKey) {
    super("UNAUTHORIZED", { message });
  }
}

export class ForbiddenError extends DomainException<"FORBIDDEN"> {
  constructor(message: TranslationKey) {
    super("FORBIDDEN", { message });
  }
}

export class ConflictError extends DomainException<"CONFLICT"> {
  constructor(message: TranslationKey) {
    super("CONFLICT", { message });
  }
}

export class BadRequestError extends DomainException<"BAD_REQUEST"> {
  constructor(message: TranslationKey) {
    super("BAD_REQUEST", { message });
  }
}

export class ValidationError extends DomainException<"VALIDATION_ERROR"> {
  constructor(message: TranslationKey) {
    super("VALIDATION_ERROR", { message });
  }
}

export class InternalError extends DomainException<"INTERNAL_ERROR"> {
  constructor(message: TranslationKey) {
    super("INTERNAL_ERROR", { message });
  }
}

export class TimeoutError extends DomainException<"TIMEOUT_ERROR"> {
  constructor(message: TranslationKey) {
    super("TIMEOUT_ERROR", { message });
  }
}
