import { eq, or } from "drizzle-orm";
import { db } from "@fludge/db";
import { auth } from "@fludge/auth";
import { user } from "@fludge/db/schema/auth";
import { tryCatch } from "@fludge/utils/try-catch";
import { InternalServerErrorException } from "@fludge/api/modules/shared/exceptions/internal-server-error.exception";
import { UserAlreadyExistsException } from "@fludge/api/modules/auth/exceptions/user-already-exists.exception";
import type { SignUpUsernameSchema } from "@fludge/utils/validators/auth.schemas";

export class CreateEmployeeUseCase {
  public static instance: CreateEmployeeUseCase;

  private constructor() {}

  public static getInstance() {
    if (!CreateEmployeeUseCase.instance) {
      CreateEmployeeUseCase.instance = new CreateEmployeeUseCase();
    }
    return CreateEmployeeUseCase.instance;
  }

  public async execute(organizationId: string, values: SignUpUsernameSchema) {
    const { data: isUsernameAvailable, error: isUsernameAvailableError } =
      await tryCatch(
        db
          .select({ id: user.id })
          .from(user)
          .where(
            or(
              eq(user.email, values.email),
              eq(user.username, values.username),
            ),
          )
          .limit(1),
      );

    if (isUsernameAvailableError)
      throw new InternalServerErrorException(isUsernameAvailableError.message);

    if (isUsernameAvailable.length > 0)
      throw new UserAlreadyExistsException(
        "El usuario ya existe. Por favor, elija otro nombre de usuario o correo electrónico.",
      );

    const { data: createdEmployee, error } = await tryCatch(
      auth.api.signUpEmail({
        body: {
          email: values.email, // required
          name: values.email, // required
          password: values.password, // required
          username: values.username, // required
          displayUsername: values.username,
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

    if (!createdMember)
      throw new InternalServerErrorException(
        "Hubo un error al asignar el usuario",
      );

    return {
      ...createdMember,
      role: createdMember.role as "member",
      user: {
        id: createdEmployee.user.id,
        name: createdEmployee.user.name,
        email: createdEmployee.user.email,
        image: createdEmployee.user.image,
      },
    };
  }
}

export function createEmployeeUseCase() {
  return CreateEmployeeUseCase.getInstance();
}
