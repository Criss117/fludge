import { orpc } from "@/integrations/orpc";
import { queryClient } from "@/integrations/tanstack-query";
import {
  createCollection,
  type Collection,
  type NonSingleResult,
} from "@tanstack/db";
import {
  queryCollectionOptions,
  type QueryCollectionUtils,
} from "@tanstack/query-db-collection";

export type Employee = Awaited<
  ReturnType<typeof orpc.employees.findAll.call>
>[number] & {
  isPending?: boolean;
};

type EmployeeCollection = Collection<
  Employee,
  string | number,
  QueryCollectionUtils<Employee, string | number, Employee, unknown>,
  never,
  Employee
> &
  NonSingleResult;

const collectionsCache = new Map<string, EmployeeCollection>();

export function defaultEmployee(name: string, email: string): Employee {
  const id = Math.random().toString(36).substring(2, 15);
  const userId = Math.random().toString(36).substring(2, 15);

  return {
    id,
    createdAt: new Date(),
    organizationId: "",
    role: "member",
    isPending: true,
    userId,
    user: {
      email,
      id: userId,
      name,
      image: undefined,
    },
  };
}

export function employeesCollectionBuilder(orgId: string) {
  if (!collectionsCache.has(orgId)) {
    const collection = createCollection(
      queryCollectionOptions<Employee>({
        queryClient,
        queryKey: ["organization", orgId, "employees"],
        queryFn: () => {
          return orpc.employees.findAll.call();
        },
        getKey: (item) => item.id,
        meta: {
          newUserName: "",
          newUserPassword: "",
        },
      }),
    );

    collectionsCache.set(orgId, collection);
  }

  return collectionsCache.get(orgId)!;
}
