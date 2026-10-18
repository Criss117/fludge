import { expoClient } from "@better-auth/expo/client";
import { generateIamContainer } from "@fludge/client/iam/container";
import type { SessionRepository } from "@fludge/client/iam/domain/session.repository";
import { env } from "@fludge/env/native";
import { toRepositoryError } from "@fludge/utils/errors/repository.error";
import { err, ok } from "@fludge/utils/trycatch";
import { createAuthClient } from "better-auth/react";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

import { NativeAppRepository } from "@/core/iam/repositories/native-app-repository";
import { NativeGroupRepository } from "@/core/iam/repositories/native-group.repository";
import { NativeMemberRepository } from "@/core/iam/repositories/native-member.repository";
import { NativeOrganizationRepository } from "@/core/iam/repositories/native-organization.repository";
import { databaseService } from "@/integrations/db";
import { NativeSyncIamRepository } from "@/integrations/db/repositories/native-sync-iam.repository";

import { syncStateRepository } from "./shared";

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

const organizationRepository = new NativeOrganizationRepository(databaseService);
const memberRepository = new NativeMemberRepository(databaseService);
const groupRepository = new NativeGroupRepository(databaseService);

const syncIamRepository = new NativeSyncIamRepository(databaseService, syncStateRepository);

const appRepository = new NativeAppRepository(databaseService);

const sessionRepository: SessionRepository = {
  getSession: async (...args) => {
    const { data, error } = await authClient.getSession(...args);

    if (error) return err(toRepositoryError("api_errors.auth.sessions.isr_on_update", error));

    return ok(data);
  },
  signUpEmail: async (...args) => {
    const { data, error } = await authClient.signUp.email(...args);

    if (error) return err(toRepositoryError("api_errors.auth.sessions.isr_on_update", error));

    return ok(data);
  },
  signInEmail: async (...args) => {
    const { data, error } = await authClient.signIn.email(...args);

    if (error) return err(toRepositoryError("api_errors.auth.sessions.isr_on_update", error));

    return ok(data);
  },
  signOut: async (...args) => {
    const { data, error } = await authClient.signOut(...args);

    if (error) return err(toRepositoryError("api_errors.auth.sessions.isr_on_update", error));

    return ok(data);
  },
};

export const iamContainer = generateIamContainer({
  organizationRepository,
  memberRepository,
  groupRepository,
  syncIamRepository,
  appRepository,
  sessionRepository,
});
