import type { MemberSelect } from "@fludge/db/schema/iam.schema";
import { UUID } from "@fludge/utils/uuid";

export type CreateMember = {
  userId: UUID;
  assignedBy: UUID | null;
  role: "member" | "owner";
};

export class Member {
  private constructor(
    private readonly _id: UUID,
    private readonly _userId: UUID,
    private readonly _createdAt: Date,
    private readonly _assignedBy: UUID | null,
    private readonly _role: "member" | "owner",
  ) {}

  public static create(values: CreateMember) {
    const now = new Date();
    return new Member(
      UUID.generate(),
      values.userId,
      now,
      values.assignedBy,
      values.role,
    );
  }

  public static reconstitute(values: MemberSelect) {
    return new Member(
      UUID.fromString(values.id),
      UUID.fromString(values.userId),
      new Date(values.createdAt),
      values.assignedBy ? UUID.fromString(values.assignedBy) : null,
      values.role as "member" | "owner",
    );
  }

  public get id() {
    return this._id;
  }

  public get userId() {
    return this._userId;
  }

  public isOwner() {
    return this._role === "owner";
  }

  public isMember() {
    return this._role === "member";
  }

  public get values(): Omit<MemberSelect, "organizationId"> {
    return {
      id: this._id.toString(),
      userId: this._userId.toString(),
      createdAt: this._createdAt,
      assignedBy: this._assignedBy?.toString() ?? null,
      role: this._role,
    };
  }

  public equals(other: Member) {
    return this._id.equals(other._id);
  }
}
