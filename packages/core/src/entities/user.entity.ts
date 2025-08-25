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
