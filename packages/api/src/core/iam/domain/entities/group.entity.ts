import { Status } from "@fludge/api/core/shared/value-objects/status";
import type {
  GroupMemberSelect,
  GroupSelect,
} from "@fludge/db/schema/iam.schema";
import type { StatusEnum } from "@fludge/utils/enums/db-enums";
import { Permissions } from "@fludge/utils/permissions/index";
import { Slug } from "@fludge/utils/slugify";
import { UUID } from "@fludge/utils/uuid";
import { GroupMember } from "./group-member.entity";
import { GroupMemberAlreadyExistsException } from "../exceptions/group-member-already-exists.exception";

export type CreateGroup = {
  name: string;
  description?: string;
  permissions: Permissions;
  createdBy: UUID;
  organizationId: UUID;
};

export type UpdateGroup = Partial<Omit<CreateGroup, "createdBy">> & {
  status?: StatusEnum;
};

function generateGroupMemberKey(groupId: UUID, memberId: UUID) {
  return `${groupId.toString()}-${memberId.toString()}`;
}

function getGroupMemberKey(groupMember: GroupMember) {
  return `${groupMember.groupId.toString()}-${groupMember.memberId.toString()}`;
}

export class Group {
  private constructor(
    private readonly _id: UUID,
    private readonly _organizationId: UUID,

    private _name: string,
    private _slug: Slug,
    private _description: string,
    private _permissions: Permissions,

    private readonly _createdBy: UUID,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _status: Status,

    private _members: Map<string, GroupMember>,
  ) {}

  public static create(values: CreateGroup) {
    const now = new Date();
    return new Group(
      UUID.generate(),
      values.organizationId,
      values.name,
      new Slug(values.name),
      values.description ?? "",
      values.permissions,
      values.createdBy,
      now,
      now,
      new Status("active"),
      new Map(),
    );
  }

  public static reconstitute(
    values: GroupSelect & {
      members: GroupMemberSelect[];
    },
  ) {
    const groupMembers = new Map(
      values.members.map((member) => {
        const entity = GroupMember.reconstitute(member);

        return [
          generateGroupMemberKey(
            UUID.fromString(member.groupId),
            UUID.fromString(member.memberId),
          ),
          entity,
        ];
      }),
    );

    return new Group(
      UUID.fromString(values.id),
      UUID.fromString(values.organizationId),
      values.name,
      new Slug(values.name),
      values.description,
      Permissions.fromList(values.permissions),
      UUID.fromString(values.createdBy),
      new Date(values.createdAt),
      values.updatedAt,
      new Status(values.status),
      groupMembers,
    );
  }

  public touch() {
    this._updatedAt = new Date();
  }

  public nameIsTaken(name: string) {
    const slug = new Slug(name);

    return this._name === name || this._slug.equals(slug);
  }

  public update(values: UpdateGroup) {
    if (values.name) {
      this._name = values.name;
      this._slug = new Slug(values.name);
    }

    if (values.description !== undefined)
      this._description = values.description;
    if (values.permissions !== undefined)
      this._permissions = values.permissions;

    if (values.status !== undefined) this._status = new Status(values.status);

    this.touch();
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

  public addGroupMember(member: GroupMember) {
    const key = getGroupMemberKey(member);

    if (this._members.has(key)) throw new GroupMemberAlreadyExistsException();

    this._members.set(key, member);

    this.touch();
  }

  public removeGroupMember(member: GroupMember | GroupMember[]) {
    const membersToRemove = Array.isArray(member) ? member : [member];

    const membersToRemoveKeys = membersToRemove.map((m) =>
      getGroupMemberKey(m),
    );

    membersToRemoveKeys.forEach((key) => this._members.delete(key));

    this.touch();
  }

  public getGroupMemberByMemberId(memberId: UUID) {
    const key = generateGroupMemberKey(this._id, memberId);

    return this._members.get(key) ?? null;
  }

  public get status() {
    return this._status;
  }

  public get id() {
    return this._id;
  }

  public get permissions() {
    return this._permissions;
  }

  public get members() {
    return this._members;
  }

  public get values(): GroupSelect & {
    members: GroupMemberSelect[];
  } {
    return {
      id: this._id.toString(),
      name: this._name,
      slug: this._slug.toString(),
      description: this._description,
      permissions: this._permissions.values,
      createdBy: this._createdBy?.toString() ?? null,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      status: this._status.value,
      organizationId: this._organizationId.toString(),
      members: Array.from(this._members.values()).map(
        (member) => member.values,
      ),
    };
  }
}
