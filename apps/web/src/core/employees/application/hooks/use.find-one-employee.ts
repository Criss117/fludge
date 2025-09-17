import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { findOneEmployeeAction } from "../actions/find-one-employee.action";

type Params = Parameters<typeof findOneEmployeeAction>[number];

export function findOneEmployeeQueryOptions(data: Params) {
  return queryOptions({
    queryFn: () => findOneEmployeeAction(data),
    queryKey: ["business", data.businessId, "employee", data.employeeId],
  });
}

export function useFindOneEmployee(data: Params) {
  const query = useSuspenseQuery(findOneEmployeeQueryOptions(data));

  if (!query.data.data) {
    throw new Error(query.data.error, {
      cause: query.data.statusCode,
    });
  }

  return {
    ...query,
    data: query.data.data,
  };
}
