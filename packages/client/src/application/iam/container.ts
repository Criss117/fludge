import type { ClientSyncIamRepository } from "@fludge/sync/repositories/iam/client-sync-iam.repository";
import type { GroupRepository } from "./domain/group.repository";
import type { MemberRepository } from "./domain/member.repository";
import type { OrganizationRepository } from "./domain/organization.repository";

type Deps = {
  organizationRepository: OrganizationRepository;
  memberRepository: MemberRepository;
  groupRepository: GroupRepository;
  syncIamRepository: ClientSyncIamRepository;
};

export function generateIamContainer(deps: Deps) {
  return {
    repositories: {
      organizationRepository: deps.organizationRepository,
      memberRepository: deps.memberRepository,
      groupRepository: deps.groupRepository,
      syncIamRepository: deps.syncIamRepository,
    },
  };
}

export type IAMContainer = ReturnType<typeof generateIamContainer>;
