import type { MemberSelect } from "@fludge/db/schema/iam.schema";
import { Member, type CreateMember } from "./member.entity";
import type { UUID } from "@fludge/utils/uuid";
import { MemberNotFoundException } from "@fludge/api/modules/iam/organization/domain/exceptions/member-not-found.exeption";
import { CantRemoveOwnerException } from "@fludge/api/modules/iam/organization/domain/exceptions/cant-remove-owner.exception";
import { MemberAlreadyExistsException } from "@fludge/api/modules/iam/organization/domain/exceptions/member-already-exists.exception";

export class MemberCollection {
  private constructor(private _members: Map<string, Member>) {}

  public static create(values?: CreateMember[]) {
    const members = values?.map((m) => Member.create(m)) ?? [];

    return new MemberCollection(
      new Map(members.map((m) => [m.id.toString(), m])),
    );
  }

  public static reconstitute(values: MemberSelect[]) {
    return new MemberCollection(
      new Map(values.map((m) => [m.id.toString(), Member.reconstitute(m)])),
    );
  }

  public get owner() {
    let owner: Member | null = null;

    for (const m of this._members.values()) {
      if (m.role.isOwner()) {
        owner = m;
        break;
      }
    }

    return owner;
  }

  public getMember(memberId: UUID) {
    const member = this._members.get(memberId.toString());

    return member ? member : null;
  }

  public addMember(member: Member) {
    if (member.role.isOwner() && this.owner)
      throw new MemberAlreadyExistsException(
        "iam.organizations.errors.has_owner",
      );

    if (this._members.has(member.id.toString()))
      throw new MemberAlreadyExistsException();

    this._members.set(member.id.toString(), member);
  }

  public removeMember(memberId: UUID) {
    const member = this._members.get(memberId.toString());

    if (!member) throw new MemberNotFoundException();

    if (member.role.isOwner()) throw new CantRemoveOwnerException();

    this._members.delete(memberId.toString());

    return member;
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

  public get all() {
    return Array.from(this._members.values());
  }

  public values(organizationId: UUID): MemberSelect[] {
    return Array.from(this._members.values()).map((member) => ({
      ...member.values,
      organizationId: organizationId.toString(),
    }));
  }
}
