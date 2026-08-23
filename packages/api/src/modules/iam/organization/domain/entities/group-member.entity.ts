import type { GroupMemberSelect } from "@fludge/db/schema/iam.schema";
import { UUID } from "@fludge/utils/uuid";

export type CreateGroupMember = {
  groupId: string;
  memberId: string;
  createdBy: string | null;
};

export class GroupMember {
  private constructor(
    private readonly _groupId: UUID,
    private readonly _memberId: UUID,
    private readonly _createdAt: Date,
    private readonly _createdBy: UUID | null,
  ) {}

  public static create(values: CreateGroupMember) {
    const now = new Date();
    return new GroupMember(
      UUID.fromString(values.groupId),
      UUID.fromString(values.memberId),
      now,
      values.createdBy ? UUID.fromString(values.createdBy) : null,
    );
  }

  public static reconstitute(values: GroupMemberSelect) {
    return new GroupMember(
      UUID.fromString(values.groupId),
      UUID.fromString(values.memberId),
      new Date(values.createdAt),
      values.createdBy ? UUID.fromString(values.createdBy) : null,
    );
  }

  public get groupId() {
    return this._groupId;
  }

  public get memberId() {
    return this._memberId;
  }

  public get values(): Omit<GroupMemberSelect, "organizationId"> {
    return {
      groupId: this._groupId.toString(),
      memberId: this._memberId.toString(),
      createdAt: this._createdAt,
      createdBy: this._createdBy?.toString() ?? null,
    };
  }

  public equals(groupId: UUID, memberId: UUID) {
    return this._groupId.equals(groupId) && this._memberId.equals(memberId);
  }
}
