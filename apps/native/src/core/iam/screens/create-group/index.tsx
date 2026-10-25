import { Button, Column, Host, Spacer } from "@expo/ui/jetpack-compose";
import { fillMaxWidth, width } from "@expo/ui/jetpack-compose/modifiers";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";

import { GroupFormInputs } from "@/core/iam/components/group-form-input";
import { Icon } from "@/core/shared/components/icon";
import { KeyboardSpacerView } from "@/core/shared/components/keyboard-spacer-view";
import { SectionCard } from "@/core/shared/components/section-card";
import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

import { useCreateGroupScreen } from "./use-create-group-screen";

export function CreateGroupScreen() {
  const { t } = useTranslation();
  const colors = useThemeColor();
  const { actions, state, texts } = useCreateGroupScreen();

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
            <SectionCard title={texts.sections.details}>
              <state.form.Field name="name">
                {(field) => <GroupFormInputs.NameInput field={field} />}
              </state.form.Field>
              <state.form.Field name="description">
                {(field) => <GroupFormInputs.DescriptionInput field={field} />}
              </state.form.Field>
            </SectionCard>
          </Host>

          <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
            <Column modifiers={[fillMaxWidth()]}>
              <ThemedNativeText variant="h5">{t(texts.sections.permissions)}</ThemedNativeText>

              <state.form.AppField name="permissions">
                {(field) => (
                  <field.PermissionsField>
                    {(props) => <GroupFormInputs.PermissionsInput {...props} />}
                  </field.PermissionsField>
                )}
              </state.form.AppField>
            </Column>
          </Host>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
          <Button
            colors={{
              containerColor: colors.primary,
            }}
            onClick={actions.submit}
          >
            <Icon name="group-add" size={SPACING.lg} color={colors.onPrimary} />
            <Spacer modifiers={[width(SPACING.sm)]} />
            <ThemedNativeText color={colors.onPrimary}>{t(texts.submit)}</ThemedNativeText>
          </Button>
        </Host>
        <KeyboardSpacerView />
      </View>
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
    justifyContent: "center",
    alignItems: "center",
    rowGap: SPACING.md,
  },
});
