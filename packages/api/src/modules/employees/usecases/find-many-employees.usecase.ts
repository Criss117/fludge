import { and, eq, getTableColumns } from "drizzle-orm";
import { tryCatch } from "@fludge/utils/try-catch";
import { InternalServerErrorException } from "@fludge/api/modules/shared/exceptions/internal-server-error.exception";
import { db } from "@fludge/db";
import { user } from "@fludge/db/schema/auth";
import { member } from "@fludge/db/schema/organization";

export class FindManyEmployeesUseCase {
  public async execute(organizationId: string) {
    const { data: employees, error } = await tryCatch(
      db
        .select({
          ...getTableColumns(member),
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            phone: user.phone,
            cc: user.cc,
            address: user.address,
          },
        })
        .from(member)
        .innerJoin(user, eq(user.id, member.userId))
        .where(and(eq(member.organizationId, organizationId))),
    );

    if (error) throw new InternalServerErrorException(error.message);

    return employees;
  }
}

export const findManyEmployeesUseCase = new FindManyEmployeesUseCase();
