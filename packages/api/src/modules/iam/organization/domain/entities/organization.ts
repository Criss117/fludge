import { Member } from "./members";
import { type CreateGroup, Group } from "./group";

import { GroupNotFoundException } from "../exceptions/group-not-found.exception";
import { MemberNotFoundException } from "../exceptions/member-not-found.exeption";
import { MemberAlreadyExistsException } from "../exceptions/member-already-exists.exception";
import { UUID } from "@fludge/utils/uuid";
import { Slug } from "@fludge/utils/slugify";
import type {
  MemberSelect,
  OrganizationSelect,
} from "@fludge/db/schema/auth.schema";
import type {
  GroupMemberSelect,
  GroupSelect,
} from "@fludge/db/schema/iam.schema";
import { GroupMember } from "./group-members";
import { GroupMemberAlreadyExistsException } from "../exceptions/group-member-elready-exists.exception";

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
    private readonly _createdAt: Date,
    private _groups: Map<string, Group>,
    private _members: Map<string, Member>,
    private _groupMembers: GroupMember[],
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
      now,
      new Map(groups.map((g) => [g.id.toString(), g])),
      new Map(),
      [],
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
      new Date(values.createdAt),
      new Map(groups.map((g) => [g.id.toString(), g])),
      new Map(members.map((m) => [m.id.toString(), m])),
      values.groupMembers.map((gm) => GroupMember.reconstitute(gm)),
    );
  }

  public addMember(member: Member) {
    if (member.isOwner()) {
      let existingOwner = false;

      for (const m of this._members.values()) {
        if (m.isOwner()) {
          existingOwner = true;
          break;
        }
      }

      if (existingOwner) return;
    }

    if (this._members.has(member.id.toString())) {
      throw new MemberAlreadyExistsException();
    }
    this._members.set(member.id.toString(), member);
  }

  public removeMember(memberId: UUID) {
    const member = this._members.get(memberId.toString());

    if (!member) return;

    if (member.isOwner()) return;

    this._groupMembers = this._groupMembers.filter(
      (gm) => !gm.memberId.equals(memberId),
    );

    this._members.delete(memberId.toString());
  }

  public addGroup(group: Group) {
    this._groups.set(group.id.toString(), group);
  }

  public removeGroup(groupId: UUID) {
    this._groups.delete(groupId.toString());
    this._groupMembers = this._groupMembers.filter(
      (gm) => !gm.groupId.equals(groupId),
    );
  }

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
    const groupKey = groupId.toString();
    if (!this._groups.has(groupKey)) throw new GroupNotFoundException();

    this._groupMembers = this._groupMembers.filter(
      (gm) => !gm.groupId.equals(groupId) || !gm.memberId.equals(memberId),
    );
  }

  public getMembersOfGroup(groupId: UUID): Member[] {
    const gms = this._groupMembers.filter((gm) => gm.groupId.equals(groupId));
    return gms
      .map((gm) => this._members.get(gm.memberId.toString()))
      .filter(Boolean) as Member[];
  }

  public getGroupsOfMember(memberId: UUID): Group[] {
    const gms = this._groupMembers.filter((gm) => gm.memberId.equals(memberId));
    return gms
      .map((gm) => this._groups.get(gm.groupId.toString()))
      .filter(Boolean) as Group[];
  }

  public get id() {
    return this._id.toString();
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
      members: Array.from(this._members.values()).map((member) => ({
        ...member.values,
        organizationId: this.id,
      })),
      groups: Array.from(this._groups.values()).map((group) => ({
        organizationId: this.id,
        ...group.values,
      })),
      groupMembers: this._groupMembers.map((member) => ({
        ...member.values,
        organizationId: this.id,
      })),
    };
  }
}
