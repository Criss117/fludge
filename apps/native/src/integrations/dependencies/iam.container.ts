import { SqliteOrganizationRepository } from "@/modules/iam/repositories/organization.repository";
import { generateIamContainer } from "@fludge/client/iam/container";
import { databaseService } from "../db";
import { SqliteMemberRepository } from "@/modules/iam/repositories/member.repository";
import { SqliteGroupRepository } from "@/modules/iam/repositories/group.repository";
import { NativeSyncIamRepository } from "../db/repositories/native-sync-iam.repository";

const organizationRepository = new SqliteOrganizationRepository(
  databaseService
);
const memberRepository = new SqliteMemberRepository(databaseService);
const groupRepository = new SqliteGroupRepository(databaseService);

const syncIamRepository = new NativeSyncIamRepository(databaseService);

export const iamContainer = generateIamContainer({
  organizationRepository,
  memberRepository,
  groupRepository,
  syncIamRepository,
});
