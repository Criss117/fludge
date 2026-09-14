import { SqliteOrganizationRepository } from "@/modules/iam/organizations/repositories/organization.repository";
import { generateIamContainer } from "@fludge/client/application/iam/container";
import { databaseService } from "../db";
import { SqliteMemberRepository } from "@/modules/iam/organizations/repositories/member.repository";
import { SqliteGroupRepository } from "@/modules/iam/organizations/repositories/group.repository";

const organizationRepository = new SqliteOrganizationRepository(
  databaseService
);
const memberRepository = new SqliteMemberRepository(databaseService);
const groupRepository = new SqliteGroupRepository(databaseService);

export const iamContainer = generateIamContainer({
  organizationRepository,
  memberRepository,
  groupRepository,
});
