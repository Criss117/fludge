import { Host, VStack } from "@expo/ui/swift-ui";
import { Stack, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";

import {
  ContactSection,
  CreditSection,
  GeneralInformationSection,
} from "@/core/commerce/components/customer-form-sections";
import { KeyboardSpacerView } from "@/core/shared/components/keyboard-spacer-view";
import { ThemedScrollView, ThemedView } from "@/core/shared/components/themed-view";
import { SPACING } from "@/lib/sp";

import type { CustomerFormScreenProps } from "./types";
import { useCustomerFormScreen } from "./use-customer-form";

function StackConfig({ onSubmit, submitLabel }: { onSubmit: () => void; submitLabel: string }) {
  const router = useRouter();

  return (
    <>
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button icon="chevron.backward" onPress={() => router.back()} />
      </Stack.Toolbar>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button onPress={onSubmit}>
          <Stack.Toolbar.Label>{submitLabel}</Stack.Toolbar.Label>
        </Stack.Toolbar.Button>
      </Stack.Toolbar>
    </>
  );
}

export function CustomerFormScreen(props: CustomerFormScreenProps) {
  const { t } = useTranslation();
  const { actions, state, texts } = useCustomerFormScreen(props);

  return (
    <>
      <StackConfig onSubmit={actions.submit} submitLabel={t(texts.submit)} />
      <ThemedView style={styles.container}>
        <ThemedScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentInsetAdjustmentBehavior="automatic"
        >
          <Host matchContents={{ vertical: true }} style={styles.host} ignoreSafeArea="all">
            <VStack spacing={SPACING.xl}>
              <GeneralInformationSection form={state.form} />
              <CreditSection form={state.form} />
              <ContactSection form={state.form} />
            </VStack>
          </Host>
        </ThemedScrollView>
        <KeyboardSpacerView />
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SPACING.sm,
  },
  contentContainer: {
    paddingTop: SPACING.md,
    paddingHorizontal: SPACING.sm,
    paddingBottom: SPACING.xl,
  },

  host: {
    alignSelf: "stretch",
  },
});
