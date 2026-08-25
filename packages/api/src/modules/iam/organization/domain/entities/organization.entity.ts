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
import { Permissions, type AppStatement } from "@fludge/utils/permissions";
import { GroupCollection } from "./group.collection";
import { MemberCollection } from "./member.collection";
import { Status } from "@fludge/api/modules/shared/domain/value-objects/status";
import { GroupMemberNotFoundException } from "../exceptions/group-member-not-found.exception";
import { GroupMemberAlreadyExistsException } from "../exceptions/group-member-elready-exists.exception";
import { MemberIsOwnerException } from "../exceptions/member-is-owner.exception";

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
    private _groupMembers: Map<string, GroupMember>,
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
      new Map(),
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
    const groupMembers = new Map(
      values.groupMembers.map((gm) => {
        const groupMember = GroupMember.reconstitute(gm);

        return [Organization.generateGroupMemberKey(groupMember), groupMember];
      }),
    );

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
      groupMembers,
      values.createdAt,
      values.updatedAt,
      new Status(values.status),
    );
  }

  public static generateGroupMemberKey(gm: GroupMember) {
    return Organization.generateGroupMemberKeyFromIds(gm.groupId, gm.memberId);
  }

  public static generateGroupMemberKeyFromIds(groupId: UUID, memberId: UUID) {
    return `${groupId.toString()}-${memberId.toString()}`;
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

  public deleteGroup(groupId: UUID) {
    const members = this.getMembersOfGroup(groupId);

    const groupMembers: GroupMember[] = [];
    for (const member of members) {
      const gm = this.removeGroupMember(groupId, member.id);

      groupMembers.push(gm);
    }

    const group = this._groups.removeGroup(groupId);

    return {
      group,
      groupMembers,
    };
  }

  // GroupMember methods
  public addGroupMember(groupMember: GroupMember) {
    if (!this._groups.getGroup(groupMember.groupId))
      throw new GroupNotFoundException();

    const member = this._members.getMember(groupMember.memberId);

    if (!member) throw new MemberNotFoundException();

    if (member.role.isOwner()) throw new MemberIsOwnerException();

    const existingGroupMember = this._groupMembers.get(
      Organization.generateGroupMemberKey(groupMember),
    );

    if (existingGroupMember) throw new GroupMemberAlreadyExistsException();

    this._groupMembers.set(
      Organization.generateGroupMemberKey(groupMember),
      groupMember,
    );
  }

  public removeGroupMember(groupId: UUID, memberId: UUID) {
    if (!this._groups.getGroup(groupId)) throw new GroupNotFoundException();

    const member = this._members.getMember(memberId);

    if (!member) throw new MemberNotFoundException();

    if (member.role.isOwner()) throw new MemberIsOwnerException();

    const existingGroupMember = this._groupMembers.get(
      Organization.generateGroupMemberKeyFromIds(groupId, memberId),
    );

    if (!existingGroupMember) throw new GroupMemberNotFoundException();

    this._groupMembers.delete(
      Organization.generateGroupMemberKeyFromIds(groupId, memberId),
    );

    return existingGroupMember;
  }

  public getGroupsOfMember(
    memberId: UUID,
    options?: { onlyActive?: boolean },
  ): Group[] {
    const gms = Array.from(this._groupMembers.values()).filter((gm) =>
      gm.memberId.equals(memberId),
    );

    const groups = gms
      .map((gm) => this._groups.getGroup(gm.groupId))
      .filter(Boolean) as Group[];

    return options?.onlyActive
      ? groups.filter((g) => g.status.isActive())
      : groups;
  }

  public getMembersOfGroup(groupId: UUID): Member[] {
    const gms = Array.from(this._groupMembers.values()).filter((gm) =>
      gm.groupId.equals(groupId),
    );

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

  public get groupMembers() {
    return Array.from(this._groupMembers.values());
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
      groupMembers: Array.from(this._groupMembers.values()).map((member) => ({
        ...member.values,
        organizationId: this.id.toString(),
      })),
      status: this._status.value,
    };
  }
}
