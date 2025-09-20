import type { Permission } from "../value-objects/permission.vo";
import type { AuditMetadata } from "./audit-metadata";
import type { GroupSummary } from "./group.entity";

export interface UserDetail extends AuditMetadata {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  username: string;
  password: string;
  isRoot: boolean;
  isAccountValidated: boolean;
}

export interface UserSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  username: string;
  createdAt: Date;
}

export interface LogedUser extends Omit<UserDetail, "password"> {
  isEmployeeIn: {
    id: string;
    name: string;
    nit: string;
    permissions: Permission[];
  }[];
  isRootIn: {
    id: string;
    name: string;
    nit: string;
  }[];
}

export interface EmployeeDetail extends Omit<UserDetail, "password"> {
  employeeIn: string;
  groups: GroupSummary[];
}
