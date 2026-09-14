import { useUpdateGroup } from "@fludge/client/application/iam/mutations/use-group.mutations";
import { useKeyboardGradualHeight } from "@/modules/shared/hooks/use-keyboard-gradual-height";
import { MaterialIcons } from "@/modules/shared/components/icons";
import { useRouter } from "expo-router";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { ScrollView, View } from "react-native";
import { GroupFormInputs } from "../components/group-form-inputs";
import { useTranslation } from "react-i18next";
import { useGroupForm } from "@fludge/client/presentation/iam/group.form";
import { useMutationToast } from "@/modules/shared/hooks/use-mutation-toast";
import type { TranslationKey } from "@fludge/i18n/index";
import { Card } from "heroui-native/card";
import { Button } from "heroui-native/button";
import { GroupDetail } from "@fludge/client/application/iam/domain/group.repository";

const PADDING_BOTTOM = 20;

export function UpdateGroupScreen({ group }: { group: GroupDetail }) {
  const { t } = useTranslation();
  const { height } = useKeyboardGradualHeight(PADDING_BOTTOM);
  const mutation = useUpdateGroup();
  const mutationToast = useMutationToast("update-group-toast");
  const router = useRouter();

  const form = useGroupForm(
    {
      onSubmit: ({ value }) => {
        const hasPermissions = Object.values(value.permissions).some(
          (actions) => actions !== undefined && actions.length > 0
        );

        if (!hasPermissions) return;

        mutationToast.showIsPendingToast("mutations.groups.update.is_pending");

        mutation.mutate(
          {
            id: group.id,
            name: value.name,
            description: value.description,
            permissions: value.permissions,
          },
          {
            onSuccess: () => {
              mutationToast.showSuccessToast(
                "mutations.groups.update.success.title",
                "mutations.groups.update.success.description"
              );
              router.back();
            },
            onError: (error) => {
              mutationToast.showErrorToast(
                "mutations.groups.update.error",
                error.message as TranslationKey
              );
            },
          }
        );
      },
    },
    {
      name: group.name,
      description: group.description ?? "",
      permissions: group.permissions,
    }
  );

  const keyboardSpacer = useAnimatedStyle(() => {
    const keyboardHeight = height.get();
    return {
      height: Math.abs(keyboardHeight),
      marginBottom: keyboardHeight > 0 ? 0 : PADDING_BOTTOM,
    };
  });

  return (
    <View className="relative flex-1">
      <ScrollView
        className="flex-1 px-3"
        contentContainerClassName="pb-32"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-y-8">
          <Card className="gap-y-4">
            <Card.Header>
              <Card.Title>
                {t("screens.groups.create_group.sections.details")}
              </Card.Title>
            </Card.Header>
            <Card.Body className="gap-y-3">
              {/* react-doctor-disable-next-line no-children-prop -- TanStack Form render-prop API requires explicit children callbacks. */}
              <form.Field
                name="name"
                children={(field) => (
                  <GroupFormInputs.NameInput field={field} />
                )}
              />
              {/* react-doctor-disable-next-line no-children-prop -- TanStack Form render-prop API requires explicit children callbacks. */}
              <form.Field
                name="description"
                children={(field) => (
                  <GroupFormInputs.DescriptionInput field={field} />
                )}
              />
            </Card.Body>
          </Card>

          <View>
            <form.AppField name="permissions">
              {(field) => (
                <field.PermissionsField>
                  {(props) => (
                    <GroupFormInputs.PermissionsListInput {...props} />
                  )}
                </field.PermissionsField>
              )}
            </form.AppField>
          </View>
        </View>
        <Animated.View style={keyboardSpacer} />
      </ScrollView>
      <View className="bg-background absolute bottom-0 w-full px-3 py-6">
        <Button onPress={form.handleSubmit} isDisabled={mutation.isPending}>
          <MaterialIcons name="save" size={20} className="text-eclipse" />
          <Button.Label>{t("screens.groups.update_group.submit")}</Button.Label>
        </Button>
      </View>
    </View>
  );
}

export function UpdateGroupScreenSkeleton() {
  return null;
}
