import { databaseService } from "@/integrations/db";
import { NativeOrganizationRepository } from "@/core/iam/repositories/native-organization.repository";
import { generateIamContainer } from "@fludge/client/iam/container";
import { NativeMemberRepository } from "@/core/iam/repositories/native-member.repository";
import { NativeGroupRepository } from "@/core/iam/repositories/native-group.repository";
import { NativeSyncIamRepository } from "@/integrations/db/repositories/native-sync-iam.repository";
import { NativeAppRepository } from "@/core/iam/repositories/native-app-repository";
import { syncStateRepository } from "./shared";
import type { SessionRepository } from "@fludge/client/iam/domain/session.repository";
import { createAuthClient } from "better-auth/react";
import { env } from "@fludge/env/native";
import { expoClient } from "@better-auth/expo/client";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

export const authClient = createAuthClient({
  baseURL: env.EXPO_PUBLIC_SERVER_URL,
  plugins: [
    expoClient({
      scheme: Constants.expoConfig?.scheme as string,
      storagePrefix: Constants.expoConfig?.scheme as string,
      storage: SecureStore,
    }),
  ],
});

const organizationRepository = new NativeOrganizationRepository(
  databaseService,
);
const memberRepository = new NativeMemberRepository(databaseService);
const groupRepository = new NativeGroupRepository(databaseService);

const syncIamRepository = new NativeSyncIamRepository(
  databaseService,
  syncStateRepository,
);

const appRepository = new NativeAppRepository(databaseService);

const sessionRepository: SessionRepository = {
  getSession: authClient.getSession,
  signUpEmail: authClient.signUp.email,
  signInEmail: authClient.signIn.email,
  signOut: authClient.signOut,
};

export const iamContainer = generateIamContainer({
  organizationRepository,
  memberRepository,
  groupRepository,
  syncIamRepository,
  appRepository,
  sessionRepository,
});
