import { Permission } from "../value-objects/permission.vo";
import { AuditMetadata } from "./audit-metadata";

export interface UserEntity extends AuditMetadata {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  username: string;
  password: string;
  isRoot: boolean;
  isAccountValidated: boolean;
}

export interface RootUserEntity extends Omit<UserEntity, "email" | "isRoot"> {
  email: string;
  isRoot: true;
}

export interface EmployeeEntity extends Omit<UserEntity, "isRoot"> {
  isRoot: false;
}

export interface LogedUser extends Omit<UserEntity, "password"> {
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
