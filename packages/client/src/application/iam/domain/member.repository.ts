import type {
  LocalGroup,
  LocalMember,
  LocalUser,
} from "@fludge/sync/entities/iam.entities";

export type MemberSummary = LocalMember & {
  user: LocalUser;
};

export type MemberDetail = MemberSummary & {
  groups: LocalGroup[];
};

export type FindAllMembersFilters = {
  searchQuery?: string;
  excludeIds?: string[];
};

export function normalizeFilters(filters?: FindAllMembersFilters) {
  return {
    searchQuery: filters?.searchQuery?.trim() || undefined,
    excludeIds: filters?.excludeIds?.length
      ? [...filters.excludeIds].sort()
      : undefined,
  };
}

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
