import type { IncomingHttpHeaders } from "node:http";
import { and, eq } from "drizzle-orm";
import { WithAuthHeader } from "@fludge/api/modules/shared/usecases/with-auth-headers";
import { auth } from "@fludge/auth";
import type { CreateTeamSchema } from "@fludge/utils/validators/team.schemas";
import { db } from "@fludge/db";
import { team } from "@fludge/db/schema/auth";
import { TeamAlreadyExistsException } from "../exceptions/team-already-exists.exception";
import { ORPCError } from "@orpc/client";
import { permissionsSchema } from "@fludge/utils/validators/permission.schemas";
import { tryCatch } from "@fludge/utils/try-catch";

export class CreateTeamUseCase extends WithAuthHeader {
  public static instance: CreateTeamUseCase;

  private constructor(nodeHeaders: IncomingHttpHeaders) {
    super(nodeHeaders);
  }

  public static getInstance(nodeHeaders: IncomingHttpHeaders) {
    if (!CreateTeamUseCase.instance) {
      CreateTeamUseCase.instance = new CreateTeamUseCase(nodeHeaders);
    }
    return CreateTeamUseCase.instance;
  }

  public async execute(values: CreateTeamSchema, selectedOrgId: string) {
    const existingTeam = await db
      .select({ id: team.id })
      .from(team)
      .where(
        and(eq(team.name, values.name), eq(team.organizationId, selectedOrgId)),
      )
      .limit(1);

    if (existingTeam.length > 0) throw new TeamAlreadyExistsException();

    const { data: createdTeam, error } = await tryCatch(
      auth.api.createTeam({
        body: {
          name: values.name,
          permissions: values.permissions,
        },
        headers: this.headers,
      }),
    );

    if (error) throw new ORPCError("INTERNAL_SERVER_ERROR", error);

    const validPermissions = permissionsSchema.safeParse(values.permissions);

    if (!validPermissions.success)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Invalid permissions structure",
      });

    return { ...createdTeam, permissions: validPermissions.data };

    // if (!values.employeesId || values.employeesId.length === 0)
    //   const employeesMembers = await db
    //     .select({ userId: member.userId, userIsRoot: user.is_root })
    //     .from(member)
    //     .innerJoin(user, eq(user.id, member.userId))
    //     .where(
    //       and(
    //         inArray(member.id, values.employeesId),
    //         eq(member.role, "member"),
    //         eq(member.organizationId, createdTeam.organizationId),
    //       ),
    //     );

    // if (employeesMembers.length === 0)
    //   throw new MemberNotFoundException("Los empleados no existen");

    // const someEmployeeIsRoot = employeesMembers.some(
    //   (member) => member.userIsRoot,
    // );

    // if (someEmployeeIsRoot) throw new SomeEmployeeIsRootException();

    // const addMembersPromise = values.employeesId.map((employeeId) =>
    //   auth.api.addTeamMember({
    //     body: {
    //       teamId: createdTeam.id,
    //       userId: employeeId,
    //     },
    //     headers: this.headers,
    //   }),
    // );

    // const result = await Promise.all(addMembersPromise);

    // return {
    //   ...createdTeam,
    //   permissions: createdTeam.permissions,
    //   members: result.filter((member) => member !== null),
    // };
  }
}

export function createTeamUseCase(nodeHeaders: IncomingHttpHeaders) {
  return CreateTeamUseCase.getInstance(nodeHeaders);
}
