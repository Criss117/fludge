import { and, eq, getTableColumns, sql } from "drizzle-orm";
import { tryCatch } from "@fludge/utils/try-catch";
import { InternalServerErrorException } from "@fludge/api/modules/shared/exceptions/internal-server-error.exception";
import { db } from "@fludge/db";
import { member, team, teamMember, user } from "@fludge/db/schema/auth";
import { parseTeamsOnEmployee } from "@fludge/utils/validators/employees.schemas";

export class FindManyEmployeesUseCase {
  public static instance: FindManyEmployeesUseCase;

  private constructor() {}

  public static getInstance() {
    if (!FindManyEmployeesUseCase.instance) {
      FindManyEmployeesUseCase.instance = new FindManyEmployeesUseCase();
    }
    return FindManyEmployeesUseCase.instance;
  }

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
          teams: sql<string>`
            JSON_GROUP_ARRAY(
              JSON_OBJECT(
                'name', ${team.name},
                'id', ${team.id}
              )
            )
          `,
        })
        .from(member)
        .innerJoin(user, eq(user.id, member.userId))
        .leftJoin(teamMember, eq(teamMember.userId, user.id))
        .leftJoin(team, eq(team.id, teamMember.teamId))
        .where(
          and(
            eq(member.organizationId, organizationId),
            eq(member.role, "member"),
          ),
        )
        .groupBy(member.id),
    );

    if (error) throw new InternalServerErrorException(error.message);

    return employees.map((employee) => {
      const objTeams = JSON.parse(employee.teams);

      const parsedTeams = parseTeamsOnEmployee.safeParse(objTeams);

      return {
        ...employee,
        teams: parsedTeams.success ? parsedTeams.data : [],
      };
    });
  }
}

export function findManyEmployeesUseCase() {
  return FindManyEmployeesUseCase.getInstance();
}
