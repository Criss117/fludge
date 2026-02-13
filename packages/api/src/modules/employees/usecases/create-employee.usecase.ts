import { tryCatch } from "@fludge/utils/try-catch";
import { auth } from "@fludge/auth";
import { InternalServerErrorException } from "../../shared/exceptions/internal-server-error.exception";

export class CreateEmployeeUseCase {
  public static instance: CreateEmployeeUseCase;

  private constructor() {}

  public static getInstance() {
    if (!CreateEmployeeUseCase.instance) {
      CreateEmployeeUseCase.instance = new CreateEmployeeUseCase();
    }
    return CreateEmployeeUseCase.instance;
  }

  public async execute(organizationId: string) {
    const { data: createdEmployee, error } = await tryCatch(
      auth.api.signUpEmail({
        body: {
          email: "email@domain.com", // required
          name: "Test User", // required
          password: "password1234", // required
          username: "test2",
          displayUsername: "Test User123",
          isRoot: false,
        },
      }),
    );

    if (error) throw new InternalServerErrorException(error.message);

    const { data: createdMember, error: addMemberError } = await tryCatch(
      auth.api.addMember({
        body: {
          userId: createdEmployee.user.id,
          role: "member",
          organizationId,
        },
      }),
    );

    if (addMemberError)
      throw new InternalServerErrorException(addMemberError.message);

    return {
      ...createdEmployee,
      member: createdMember,
    };
  }
}

export function createEmployeeUseCase() {
  return CreateEmployeeUseCase.getInstance();
}
