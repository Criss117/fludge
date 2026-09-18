import type {
  LocalGroupSelect,
  LocalMemberSelect,
  LocalUserSelect,
} from "@fludge/db/local-schemas/shared.schema";

export type MemberSummary = LocalMemberSelect & {
  user: LocalUserSelect;
};

export type MemberDetail = MemberSummary & {
  groups: LocalGroupSelect[];
};

export type FindAllMembersFilters = {
  searchQuery?: string;
  excludeIds?: string[];
};

export interface MemberRepository {
  findAll(
    organizationId: string,
    filters?: FindAllMembersFilters,
  ): Promise<MemberSummary[]>;

  findOneById(
    organizationId: string,
    memberId: string,
  ): Promise<MemberDetail | null>;

  save(member: MemberSummary | MemberSummary[]): Promise<void>;

  delete(organizationId: string, memberIds: string | string[]): Promise<void>;
}
