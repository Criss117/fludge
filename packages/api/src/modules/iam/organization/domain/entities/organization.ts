import { Member } from "./members";
import { type CreateGroup, Group, type UpdateGroup } from "./group";

import { GroupNotFoundException } from "../exceptions/group-not-found.exception";
import { MemberNotFoundException } from "../exceptions/member-not-found.exeption";
import { MemberAlreadyExistsException } from "../exceptions/member-already-exists.exception";
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
import { GroupMember } from "./group-members";
import { GroupMemberAlreadyExistsException } from "@fludge/api/modules/iam/organization/domain/exceptions/group-member-elready-exists.exception";
import type { AppStatement } from "@fludge/utils/permissions";
import { CantRemoveOwnerException } from "../exceptions/cant-remove-owner.exception";
import { GroupAlreadyExistsException } from "../exceptions/group-already-exists.exception";

type CreateOrganization = {
  name: string;
  logo?: string | null;
  metadata?: string | null;
  legalName: string;
  taxId: string;
  address: string;
  phone: string;
  groups?: CreateGroup[];
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
    private _groups: Map<string, Group>,
    private _members: Map<string, Member>,
    private _groupMembers: GroupMember[],
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  public static create(values: CreateOrganization) {
    const now = new Date();

    const groups = values.groups?.map((g) => Group.create(g)) ?? [];

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
      new Map(groups.map((g) => [g.id.toString(), g])),
      new Map(),
      [],
      now,
      now,
    );
  }

  public static reconstitute(
    values: OrganizationSelect & {
      members: MemberSelect[];
      groups: GroupSelect[];
      groupMembers: GroupMemberSelect[];
    },
  ) {
    const members = values.members.map((m) => Member.reconstitute(m));
    const groups = values.groups.map((g) => Group.reconstitute(g));

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
      new Map(groups.map((g) => [g.id.toString(), g])),
      new Map(members.map((m) => [m.id.toString(), m])),
      values.groupMembers.map((gm) => GroupMember.reconstitute(gm)),
      values.createdAt,
      values.updatedAt,
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

  // Member methods
  public addMember(member: Member) {
    if (member.isOwner() && this.owner)
      throw new MemberAlreadyExistsException(
        "La organizacion ya tiene un propietario",
      );

    if (this._members.has(member.id.toString()))
      throw new MemberAlreadyExistsException();

    this._members.set(member.id.toString(), member);
  }

  public get owner() {
    let owner: Member | null = null;

    for (const m of this._members.values()) {
      if (m.isOwner()) {
        owner = m;
        break;
      }
    }

    return owner;
  }

  public removeMember(memberId: UUID) {
    const member = this._members.get(memberId.toString());

    if (!member) throw new MemberNotFoundException();

    if (member.isOwner()) throw new CantRemoveOwnerException();

    this._groupMembers = this._groupMembers.filter(
      (gm) => !gm.memberId.equals(memberId),
    );

    this._members.delete(memberId.toString());
  }

  public getMemberByUserId(userId: UUID) {
    let member: Member | null = null;

    for (const m of this._members.values()) {
      if (m.userId.equals(userId)) {
        member = m;
        break;
      }
    }

    return member;
  }

  // Group methods
  public addGroup(group: Group) {
    if (this._groups.has(group.id.toString()))
      throw new GroupAlreadyExistsException();

    const nameIsTaken = this.groupNameIsAvailable(group.values.name);

    if (nameIsTaken)
      throw new GroupAlreadyExistsException("El nombre ya está en uso");

    this._groups.set(group.id.toString(), group);
  }

  public getGroup(groupId: UUID) {
    return this._groups.get(groupId.toString());
  }

  public groupNameIsAvailable(name: string, excludeId?: UUID) {
    let available = true;

    for (const group of this._groups.values()) {
      const nameIsTaken = group.nameIsTaken(name);
      const excludeThisGroup = excludeId && excludeId.equals(group.id);

      if (nameIsTaken && !excludeThisGroup) {
        available = false;
        break;
      }
    }

    return available;
  }

  public updateGroup(
    groupId: UUID,
    values: UpdateGroup & { toogleActive?: boolean },
  ) {
    const group = this._groups.get(groupId.toString());

    if (!group) throw new GroupNotFoundException();

    if (values.toogleActive) {
      if (group.isActive) group.disable();
      else group.enable();
    }

    if (
      values.name &&
      values.name !== group.values.name &&
      !this.groupNameIsAvailable(values.name, group.id)
    )
      throw new GroupAlreadyExistsException("El nombre ya está en uso");

    group.update(values);

    this._groups.set(group.id.toString(), group);
  }

  public disableGroup(groupId: UUID) {
    const group = this._groups.get(groupId.toString());

    if (!group) throw new GroupNotFoundException();

    group.disable();

    this._groups.set(group.id.toString(), group);
  }

  public enableGroup(groupId: UUID) {
    const group = this._groups.get(groupId.toString());

    if (!group) throw new GroupNotFoundException();

    group.enable();

    this._groups.set(group.id.toString(), group);
  }

  public removeGroup(groupId: UUID) {
    const group = this._groups.get(groupId.toString());

    if (!group) throw new GroupNotFoundException();

    this._groups.delete(groupId.toString());

    this._groupMembers = this._groupMembers.filter(
      (gm) => !gm.groupId.equals(groupId),
    );
  }

  // GroupMember methods
  public addGroupMember(groupId: UUID, memberId: UUID, createdBy: UUID) {
    if (!this._groups.has(groupId.toString()))
      throw new GroupNotFoundException();

    if (!this._members.has(memberId.toString()))
      throw new MemberNotFoundException();

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
    if (!this._groups.has(groupId.toString()))
      throw new GroupNotFoundException();

    this._groupMembers = this._groupMembers.filter(
      (gm) => !gm.groupId.equals(groupId) || !gm.memberId.equals(memberId),
    );
  }

  public getGroupsOfMember(memberId: UUID): Group[] {
    const gms = this._groupMembers.filter((gm) => gm.memberId.equals(memberId));
    return gms
      .map((gm) => this._groups.get(gm.groupId.toString()))
      .filter(Boolean) as Group[];
  }

  public getMembersOfGroup(groupId: UUID): Member[] {
    const gms = this._groupMembers.filter((gm) => gm.groupId.equals(groupId));
    return gms
      .map((gm) => this._members.get(gm.memberId.toString()))
      .filter(Boolean) as Member[];
  }

  public memberHasPermission(
    memberId: UUID,
    permission: Partial<AppStatement>,
  ): boolean {
    const member = this._members.get(memberId.toString());

    if (!member) return false;

    if (member.isOwner()) return true;

    const groups = this.getGroupsOfMember(memberId);

    return (
      Object.entries(permission) as [keyof AppStatement, string[]][]
    ).every(([resource, actions]) =>
      actions.every((action) =>
        groups.some((group) => {
          if (!group.isActive) return false;

          return group.permissions.has(resource, action as any);
        }),
      ),
    );
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
      members: Array.from(this._members.values()).map((member) => ({
        ...member.values,
        organizationId: this.id.toString(),
      })),
      groups: Array.from(this._groups.values()).map((group) => ({
        ...group.values,
        organizationId: this.id.toString(),
      })),
      groupMembers: this._groupMembers.map((member) => ({
        ...member.values,
        organizationId: this.id.toString(),
      })),
    };
  }
}
