import type { IncomingHttpHeaders } from "node:http";
import { WithAuthHeader } from "@fludge/api/modules/shared/usecases/with-auth-headers";
import { tryCatch } from "@fludge/utils/try-catch";
import { auth } from "@fludge/auth";
import { InternalServerErrorException } from "@fludge/api/modules/shared/exceptions/internal-server-error.exception";

export class FindManyEmployeesUseCase extends WithAuthHeader {
  public static instance: FindManyEmployeesUseCase;

  private constructor(nodeHeaders: IncomingHttpHeaders) {
    super(nodeHeaders);
  }

  public static getInstance(nodeHeaders: IncomingHttpHeaders) {
    if (!FindManyEmployeesUseCase.instance) {
      FindManyEmployeesUseCase.instance = new FindManyEmployeesUseCase(
        nodeHeaders,
      );
    }
    return FindManyEmployeesUseCase.instance;
  }

  public async execute() {
    const { data: employees, error } = await tryCatch(
      auth.api.listMembers({
        headers: this.headers,
        query: {
          sortBy: "createdAt",
          sortDirection: "desc",
        },
      }),
    );

    if (error) throw new InternalServerErrorException(error.message);

    const filterdEmployees = employees.members.filter(
      (employee) => employee.role !== "owner",
    );

    return filterdEmployees;
  }
}

export function findManyEmployeesUseCase(nodeHeaders: IncomingHttpHeaders) {
  return FindManyEmployeesUseCase.getInstance(nodeHeaders);
}
