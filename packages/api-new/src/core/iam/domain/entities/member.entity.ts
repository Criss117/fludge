import { Role } from "@core/shared/value-objects/role";
import { Status } from "@core/shared/value-objects/status";
import type { MemberSelect } from "@fludge/db/schema/iam.schema";
import type { RoleEnum } from "@fludge/utils/enums/db-enums";
import { UUID } from "@fludge/utils/uuid";

export type CreateMember = {
  userId: UUID;
  assignedBy: UUID | null;
  role: RoleEnum;
  organizationId: UUID;
};

export class Member {
  private constructor(
    private readonly _id: UUID,
    private readonly _userId: UUID,
    private readonly _organizationId: UUID,
    private readonly _assignedBy: UUID | null,
    private readonly _role: Role,
    private _status: Status,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  public static create(values: CreateMember) {
    const now = new Date();
    return new Member(
      UUID.generate(),
      values.userId,
      values.organizationId,
      values.assignedBy,
      new Role(values.role),
      Status.active(),
      now,
      now,
    );
  }

  public static reconstitute(values: MemberSelect) {
    return new Member(
      UUID.fromString(values.id),
      UUID.fromString(values.userId),
      UUID.fromString(values.organizationId),
      values.assignedBy ? UUID.fromString(values.assignedBy) : null,
      new Role(values.role),
      new Status(values.status),
      new Date(values.createdAt),
      new Date(values.updatedAt),
    );
  }

  public touch() {
    this._updatedAt = new Date();
  }

  public get id() {
    return this._id;
  }

  public get userId() {
    return this._userId;
  }

  public get role() {
    return this._role;
  }

  public get status() {
    return this._status;
  }

  public setInactive() {
    this._status = Status.inactive();
    this.touch();
  }

  public setActive() {
    this._status = Status.active();
    this.touch();
  }

  public toggleStatus() {
    this._status = this._status.toggle();
    this.touch();
  }

  public get values(): MemberSelect {
    return {
      organizationId: this._organizationId.toString(),
      id: this._id.toString(),
      userId: this._userId.toString(),
      createdAt: this._createdAt,
      assignedBy: this._assignedBy?.toString() ?? null,
      role: this._role.value,
      status: this._status.value,
      updatedAt: this._updatedAt,
    };
  }

  public equals(other: Member) {
    return this._id.equals(other._id);
  }
}
