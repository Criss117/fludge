import { NotFoundError } from "@fludge/api/core/shared/exceptions/base-exception";

export class UserNotFoundException extends NotFoundError {
  constructor() {
    super("api_errors.iam.members.not_found");
  }
}
