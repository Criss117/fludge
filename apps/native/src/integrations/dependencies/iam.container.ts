import { databaseService } from "@/integrations/db";
import { NativeOrganizationRepository } from "@/core/iam/repositories/native-organization.repository";
import { generateIamContainer } from "@fludge/client/iam/container";
import { NativeMemberRepository } from "@/core/iam/repositories/native-member.repository";
import { NativeGroupRepository } from "@/core/iam/repositories/native-group.repository";
import { NativeSyncIamRepository } from "@/integrations/db/repositories/native-sync-iam.repository";
import { NativeAppRepository } from "@/core/iam/repositories/native-app-repository";

const organizationRepository = new NativeOrganizationRepository(
  databaseService,
);
const memberRepository = new NativeMemberRepository(databaseService);
const groupRepository = new NativeGroupRepository(databaseService);

const syncIamRepository = new NativeSyncIamRepository(databaseService);

const appRepository = new NativeAppRepository(databaseService);

export const iamContainer = generateIamContainer({
  organizationRepository,
  memberRepository,
  groupRepository,
  syncIamRepository,
  appRepository,
});
