import { NativeOrganizationRepository } from "@/modules/iam/repositories/native-organization.repository";
import { generateIamContainer } from "@fludge/client/iam/container";
import { databaseService } from "../db";
import { NativeMemberRepository } from "@/modules/iam/repositories/native-member.repository";
import { NativeGroupRepository } from "@/modules/iam/repositories/native-group.repository";
import { NativeSyncIamRepository } from "../db/repositories/native-sync-iam.repository";
import { NativeAppRepository } from "@/modules/iam/repositories/native-app.repository";

const organizationRepository = new NativeOrganizationRepository(
  databaseService
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
