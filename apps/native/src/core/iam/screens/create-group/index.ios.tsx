import { Host, VStack } from "@expo/ui/swift-ui";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";

import { GroupFormInputs } from "@/core/iam/components/group-form-input";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

import { useCreateGroupScreen } from "./use-create-group-screen";

export function CreateGroupScreen() {
  const { t } = useTranslation();
  const colors = useThemeColor();
  const { actions, state, texts } = useCreateGroupScreen();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: SPACING.lg,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
            <VStack spacing={SPACING.md}>
              <state.form.Field name="name">
                {(field) => <GroupFormInputs.NameInput field={field} />}
              </state.form.Field>
              <state.form.Field name="description">
                {(field) => <GroupFormInputs.DescriptionInput field={field} />}
              </state.form.Field>
            </VStack>
          </Host>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    paddingHorizontal: SPACING.sm,
  },
  content: {
    paddingHorizontal: SPACING.sm,
    rowGap: SPACING.lg,
  },
  footer: {
    paddingHorizontal: SPACING.sm,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
  },
});
