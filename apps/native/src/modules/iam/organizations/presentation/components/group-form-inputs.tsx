import { FieldError } from "@/modules/shared/components/field-error";

import {
  ActionFor,
  PERMISSIONS,
  type Permission,
  type Resource,
} from "@fludge/utils/permissions/data";
import { Accordion } from "heroui-native/accordion";
import { Card } from "heroui-native/card";
import { Checkbox } from "heroui-native/checkbox";
import { Chip } from "heroui-native/chip";
import { ControlField } from "heroui-native/control-field";
import { Label } from "heroui-native/label";
import { Separator } from "heroui-native/separator";
import { Typography } from "heroui-native/text";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { MinimalField } from "@fludge/client/shared/field-api";
import { CommonInputs } from "@/modules/shared/components/common-input";
import { PermissionsFieldChildrenProps } from "@fludge/client/presentation/iam/group.form";
import type { TranslationKey } from "@fludge/i18n/index";

interface InputProps<T> {
  field: MinimalField<T>;
}

function NameInput({ field }: InputProps<string>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  return (
    <CommonInputs.TextInput
      isInvalid={isInvalid}
      icon="add-business"
      errors={errors}
      label="forms.group.name.label"
      inputProps={{
        value: field.state.value,
        onBlur: field.handleBlur,
        onChangeText: field.handleChange,
        placeholder: "forms.group.name.placeholder",
      }}
    />
  );
}

function DescriptionInput({ field }: InputProps<string>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  return (
    <CommonInputs.TextAreaInput
      isInvalid={isInvalid}
      errors={errors}
      label="forms.group.description.label"
      inputProps={{
        value: field.state.value,
        onBlur: field.handleBlur,
        onChangeText: field.handleChange,
        placeholder: "forms.group.description.placeholder",
      }}
    />
  );
}

function PermissionsListInput({
  isSelected,
  toggleAllFromResource,
  togglePermission,
  field,
  counts,
}: PermissionsFieldChildrenProps) {
  const { t } = useTranslation();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  return (
    <View>
      <View>
        <Typography.Heading type="h4">
          {t("forms.group.permissions.label")}
        </Typography.Heading>
        {isInvalid && <FieldError errors={errors} />}
      </View>
      <Accordion variant="surface">
        {Object.keys(PERMISSIONS).map((resource) => {
          const count = counts[resource as Resource];

          const nameKey = `permissions.${resource as Resource}.name` as const;
          const name = t(nameKey);

          return (
            <Accordion.Item key={resource} value={resource}>
              <Accordion.Trigger>
                <Typography>{name}</Typography>
                <View className="flex-row items-center gap-x-1">
                  <Chip size="sm">
                    <Chip.Label>
                      {count.selected}/{count.total}
                    </Chip.Label>
                  </Chip>
                  <Accordion.Indicator />
                </View>
              </Accordion.Trigger>
              <Accordion.Content className="gap-y-2">
                <ControlField
                  onPress={() => toggleAllFromResource(resource as Resource)}
                  isSelected={count.selected === count.total}
                >
                  <View className="flex-1 flex-row justify-between p-4">
                    <Label>{t("helpers.all_of", { resource: name })}</Label>
                    <ControlField.Indicator>
                      <Checkbox
                        className="bg-accent"
                        onPress={() =>
                          toggleAllFromResource(resource as Resource)
                        }
                      />
                    </ControlField.Indicator>
                  </View>
                </ControlField>
                <Separator />
                {PERMISSIONS[resource as Resource].map((action) => {
                  const permission = `${resource}:${action}` as Permission;

                  const actionKey =
                    `permissions.${resource}.${action}.name` as TranslationKey;
                  const actionDescriptionKey =
                    `permissions.${resource}.${action}.description` as TranslationKey;

                  return (
                    <ControlField
                      key={`${resource}:${action}`}
                      onPress={() => togglePermission(permission)}
                      isSelected={isSelected(permission)}
                    >
                      <Card className="bg-surface-tertiary flex-1 flex-row justify-between">
                        <Card.Header className="flex-1">
                          <Card.Title className="line-clamp-1">
                            {t(actionKey)}
                          </Card.Title>
                          <Card.Description className="line-clamp-1">
                            {t(actionDescriptionKey)}
                          </Card.Description>
                        </Card.Header>
                        <ControlField.Indicator>
                          <Checkbox
                            className="bg-accent"
                            onPress={() => togglePermission(permission)}
                          />
                        </ControlField.Indicator>
                      </Card>
                    </ControlField>
                  );
                })}
              </Accordion.Content>
            </Accordion.Item>
          );
        })}
      </Accordion>
    </View>
  );
}

export const GroupFormInputs = {
  NameInput,
  PermissionsListInput,
  DescriptionInput,
};
