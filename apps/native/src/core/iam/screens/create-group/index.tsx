import { Icon } from "@/core/shared/components/icon";
import { SectionCard } from "@/core/shared/components/section-card";
import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";
import { Button, Column, Host, Spacer } from "@expo/ui/jetpack-compose";
import { fillMaxWidth, width } from "@expo/ui/jetpack-compose/modifiers";
import { useGroupForm } from "@fludge/client/iam/forms/group.form";
import { useCreateGroup } from "@fludge/client/iam/mutations/use-group.mutations";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";
import { GroupFormInputs } from "../../components/group-form-input";
import { useKeyboardSpacer } from "@/core/shared/hooks/use-keyboard-spacer";
import Animated from "react-native-reanimated";
import { useToast } from "@/core/shared/components/toast-provider";

export function CreateGroupScreen() {
  const spacer = useKeyboardSpacer();
  const { t } = useTranslation();
  const mutation = useCreateGroup();
  const colors = useThemeColor();
  const { show } = useToast();

  const router = useRouter();

  const form = useGroupForm({
    onSubmit: ({ value }) => {
      mutation.mutate(
        {
          name: value.name,
          description: value.description,
          permissions: value.permissions,
        },
        {
          onSuccess: () => {
            show({
              message: "forms.group.create.success",
              duration: "short",
            });
            router.back();
          },
          onError: (e) => {
            console.log(e);
          },
        },
      );
    },
  });

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
            <SectionCard title="forms.group.details.title">
              <form.Field name="name">
                {(field) => <GroupFormInputs.NameInput field={field} />}
              </form.Field>
              <form.Field name="description">
                {(field) => <GroupFormInputs.DescriptionInput field={field} />}
              </form.Field>
            </SectionCard>
          </Host>

          <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
            <Column modifiers={[fillMaxWidth()]}>
              <ThemedNativeText variant="h5">
                {t("forms.group.permissions.label")}
              </ThemedNativeText>

              <form.AppField name="permissions">
                {(field) => (
                  <field.PermissionsField>
                    {(props) => <GroupFormInputs.PermissionsInput {...props} />}
                  </field.PermissionsField>
                )}
              </form.AppField>
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
            onClick={form.handleSubmit}
          >
            <Icon name="group-add" size={SPACING.lg} color={colors.onPrimary} />
            <Spacer modifiers={[width(SPACING.sm)]} />
            <ThemedNativeText color={colors.onPrimary}>
              {t("forms.group.create.submit")}
            </ThemedNativeText>
          </Button>
        </Host>
        <Animated.View style={spacer} />
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
