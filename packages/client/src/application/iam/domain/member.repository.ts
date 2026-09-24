import type {
  LocalGroup,
  LocalMember,
  LocalUser,
} from "@fludge/db/local-schemas/shared.schema";

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

export interface MemberRepository {
  findAll(
    organizationId: string,
    filters?: FindAllMembersFilters,
  ): Promise<MemberSummary[]>;

  findOneById(
    organizationId: string,
    memberId: string,
  ): Promise<MemberDetail | null>;

  save(member: LocalMember | LocalMember[]): Promise<void>;

  delete(organizationId: string, memberIds: string | string[]): Promise<void>;
}
