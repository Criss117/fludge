import { useCreateGroup } from "@fludge/client/application/iam/organization/mutations/use-group.mutations";
import { useGroupForm } from "@fludge/client/presentation/iam/organization/group.form";
import { useKeyboardGradualHeight } from "@/modules/shared/hooks/use-keyboard-gradual-height";
import { CommonInputs } from "@/modules/shared/components/common-input";
import { MaterialIcons } from "@/modules/shared/components/icons";
import { Button, Card, useToast } from "heroui-native";
import { useRouter } from "expo-router";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { ScrollView, View } from "react-native";
import { GroupFormInputs } from "../components/group-form-inputs";
import { useTranslation } from "react-i18next";
import type { TranslationKey } from "@fludge/i18n/index";

const PADDING_BOTTOM = 20;
const TOAST_ID = "create-group-toast";

export function CreateGroupScreen() {
  const { t } = useTranslation();
  const { height } = useKeyboardGradualHeight(PADDING_BOTTOM);
  const mutation = useCreateGroup();
  const { toast } = useToast();
  const router = useRouter();

  const form = useGroupForm({
    onSubmit: ({ value }) => {
      toast.show({
        id: TOAST_ID,
        isSwipeable: true,
        label: t("mutations.groups.create.is_pending"),
        description: t("helpers.please_wait"),
        duration: "persistent",
      });

      mutation.mutate(
        {
          name: value.name,
          description: value.description,
          permissions: value.permissions,
        },
        {
          onSuccess: () => {
            toast.show({
              id: TOAST_ID,
              isSwipeable: true,
              variant: "success",
              label: t("mutations.groups.create.success.title"),
              description: t("mutations.groups.create.success.description"),
              actionLabel: t("helpers.close"),
              onActionPress: ({ hide }) => hide(),
            });
            router.back();
          },
          onError: (error) => {
            toast.show({
              id: TOAST_ID,
              isSwipeable: true,
              variant: "danger",
              label: t("mutations.groups.create.error"),
              description: t(error.message as TranslationKey),
              actionLabel: t("helpers.close"),
              onActionPress: ({ hide }) => hide(),
            });
          },
        }
      );
    },
  });

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
              <form.AppField name="name">
                {(field) => (
                  <field.NameField>
                    {(props) => <GroupFormInputs.GroupNameInput {...props} />}
                  </field.NameField>
                )}
              </form.AppField>
              <form.AppField name="description">
                {(field) => (
                  <field.DescriptionField>
                    {({ field: state, id, isInvalid }) => (
                      <CommonInputs.DescriptionInput
                        isInvalid={isInvalid}
                        id={id}
                        value={state.state.value}
                        onBlur={state.handleBlur}
                        onChangeText={state.handleChange}
                        errors={state.state.meta.errors}
                        label="forms.group.description.label"
                        placeholder="forms.group.description.placeholder"
                      />
                    )}
                  </field.DescriptionField>
                )}
              </form.AppField>
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
          <MaterialIcons name="group-add" size={20} className="text-eclipse" />
          <Button.Label>{t("forms.group.submit")}</Button.Label>
        </Button>
      </View>
    </View>
  );
}
