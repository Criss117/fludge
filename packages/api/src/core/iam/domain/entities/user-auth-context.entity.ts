import type { PermissionsRecord } from "@fludge/utils/permissions/data";
import { Permissions } from "@fludge/utils/permissions/index";
import { UUID } from "@fludge/utils/uuid";
import type { Group } from "./group.entity";
import type { Member } from "./member.entity";

type CreateUserAuthContext = {
  organizationId: UUID;
  member: Member;
  groups: Group[];
};

export class UserAuthContext {
  private constructor(
    private readonly _organizationId: UUID,
    private readonly _member: Member,
    private readonly _groups: Group[],
  ) {}

  public static create(values: CreateUserAuthContext) {
    return new UserAuthContext(
      values.organizationId,
      values.member,
      values.groups,
    );
  }

  public get organizationId() {
    return this._organizationId;
  }

  public get member() {
    return this._member;
  }

  public get groups() {
    return this._groups;
  }

  public hasPermission(
    required: PermissionsRecord,
    mode: "all" | "any" = "all",
  ) {
    if (this._member.role.isOwner()) return true;

    const activeGroups = this._groups.filter((group) => group.status.isActive());

    return Permissions.merge(
      activeGroups.map((group) => group.permissions),
    ).checkPermissions(required, mode);
  }
}