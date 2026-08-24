import { Member, type CreateMember } from "./member.entity";
import { type CreateGroup, Group } from "./group.entity";

import { GroupNotFoundException } from "../exceptions/group-not-found.exception";
import { MemberNotFoundException } from "../exceptions/member-not-found.exeption";
import { UUID } from "@fludge/utils/uuid";
import { Slug } from "@fludge/utils/slugify";
import type {
  MemberSelect,
  OrganizationSelect,
} from "@fludge/db/schema/iam.schema";
import type {
  GroupMemberSelect,
  GroupSelect,
} from "@fludge/db/schema/iam.schema";
import { GroupMember } from "./group-member.entity";
import { GroupMemberAlreadyExistsException } from "@fludge/api/modules/iam/organization/domain/exceptions/group-member-elready-exists.exception";
import { Permissions, type AppStatement } from "@fludge/utils/permissions";
import { GroupCollection } from "./group.collection";
import { MemberCollection } from "./member.collection";
import { Status } from "@fludge/api/modules/shared/domain/value-objects/status";

type CreateOrganization = {
  name: string;
  logo?: string | null;
  metadata?: string | null;
  legalName: string;
  taxId: string;
  address: string;
  phone: string;
  groups?: CreateGroup[];
  owner: CreateMember;
};

export type UpdateOrganization = Partial<Omit<CreateOrganization, "groups">>;

export class Organization {
  private constructor(
    private readonly _id: UUID,
    private _name: string,
    private _slug: Slug,
    private _logo: string | null,
    private _metadata: string | null,
    private _legalName: string,
    private _taxId: string,
    private _address: string,
    private _phone: string,
    private _groups: GroupCollection,
    private _members: MemberCollection,
    private _groupMembers: GroupMember[],
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _status: Status,
  ) {}

  public static create(values: CreateOrganization) {
    const now = new Date();

    return new Organization(
      UUID.generate(),
      values.name,
      new Slug(values.name),
      values.logo ?? null,
      values.metadata ?? null,
      values.legalName,
      values.taxId,
      values.address,
      values.phone,
      GroupCollection.create(values.groups),
      MemberCollection.create([values.owner]),
      [],
      now,
      now,
      new Status("active"),
    );
  }

  public static reconstitute(
    values: OrganizationSelect & {
      members: MemberSelect[];
      groups: GroupSelect[];
      groupMembers: GroupMemberSelect[];
    },
  ) {
    return new Organization(
      UUID.fromString(values.id),
      values.name,
      new Slug(values.name),
      values.logo,
      values.metadata,
      values.legalName,
      values.taxId,
      values.address,
      values.phone,
      GroupCollection.reconstitute(values.groups),
      MemberCollection.reconstitute(values.members),
      values.groupMembers.map((gm) => GroupMember.reconstitute(gm)),
      values.createdAt,
      values.updatedAt,
      new Status(values.status),
    );
  }

  public update(values: UpdateOrganization) {
    const now = new Date();

    if (values.name) {
      this._name = values.name;
      this._slug = new Slug(values.name);
    }

    if (values.logo) this._logo = values.logo;
    if (values.metadata) this._metadata = values.metadata;
    if (values.legalName) this._legalName = values.legalName;
    if (values.taxId) this._taxId = values.taxId;
    if (values.address) this._address = values.address;
    if (values.phone) this._phone = values.phone;

    this._updatedAt = now;
  }

  // GroupMember methods
  public addGroupMember(groupId: UUID, memberId: UUID, createdBy: UUID) {
    if (!this._groups.getGroup(groupId)) throw new GroupNotFoundException();

    if (!this._members.getMember(memberId)) throw new MemberNotFoundException();

    if (this._groupMembers.some((gm) => gm.equals(groupId, memberId)))
      throw new GroupMemberAlreadyExistsException();

    this._groupMembers.push(
      GroupMember.create({
        groupId: groupId.toString(),
        memberId: memberId.toString(),
        createdBy: createdBy.toString(),
      }),
    );
  }

  public removeGroupMember(groupId: UUID, memberId: UUID) {
    if (!this._groups.getGroup(groupId)) throw new GroupNotFoundException();

    this._groupMembers = this._groupMembers.filter(
      (gm) => !gm.groupId.equals(groupId) || !gm.memberId.equals(memberId),
    );
  }

  public getGroupsOfMember(
    memberId: UUID,
    options?: { onlyActive?: boolean },
  ): Group[] {
    const gms = this._groupMembers.filter((gm) => gm.memberId.equals(memberId));
    const groups = gms
      .map((gm) => this._groups.getGroup(gm.groupId))
      .filter(Boolean) as Group[];

    return options?.onlyActive
      ? groups.filter((g) => g.status.isActive())
      : groups;
  }

  public getMembersOfGroup(groupId: UUID): Member[] {
    const gms = this._groupMembers.filter((gm) => gm.groupId.equals(groupId));
    return gms
      .map((gm) => this._members.getMember(gm.memberId))
      .filter(Boolean) as Member[];
  }

  public memberHasPermission(
    memberId: UUID,
    permission: Partial<AppStatement>,
  ): boolean {
    const member = this._members.getMember(memberId);

    if (!member) return false;

    if (member.role.isOwner()) return true;

    const groups = this.getGroupsOfMember(memberId, {
      onlyActive: true,
    });

    const mergedPermissions = Permissions.merge(
      groups.map((g) => g.permissions),
    );

    return mergedPermissions.satisfies(permission);
  }

  public get status() {
    return this._status;
  }

  public get groups() {
    return this._groups;
  }

  public get members() {
    return this._members;
  }

  public get id() {
    return this._id;
  }

  public get values(): OrganizationSelect & {
    members: MemberSelect[];
    groups: GroupSelect[];
    groupMembers: GroupMemberSelect[];
  } {
    return {
      id: this._id.toString(),
      name: this._name,
      slug: this._slug.toString(),
      logo: this._logo,
      metadata: this._metadata,
      legalName: this._legalName,
      taxId: this._taxId,
      address: this._address,
      phone: this._phone,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      members: this._members.values(this.id),
      groups: this._groups.values(this.id),
      groupMembers: this._groupMembers.map((member) => ({
        ...member.values,
        organizationId: this.id.toString(),
      })),
      status: this._status.value,
    };
  }
}
