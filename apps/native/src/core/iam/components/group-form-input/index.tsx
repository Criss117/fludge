import { Accordion } from "@/core/shared/components/accordion";
import { FieldError } from "@/core/shared/components/field-error";
import { TextInput } from "@/core/shared/components/text-input";
import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";
import { Card, Checkbox, Column, Row, Spacer } from "@expo/ui/jetpack-compose";
import {
  clickable,
  fillMaxWidth,
  padding,
  weight,
} from "@expo/ui/jetpack-compose/modifiers";
import type { PermissionsFieldChildrenProps } from "@fludge/client/iam/forms/group.form";
import type { MinimalField } from "@fludge/client/shared/field-api";
import type { TranslationKey } from "@fludge/i18n/index";
import {
  type Permission,
  PERMISSIONS,
  type Resource,
} from "@fludge/utils/permissions/data";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface InputProps<T> {
  field: MinimalField<T>;
}

function NameInput({ field }: InputProps<string>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <TextInput
      value={field.state.value}
      label="forms.group.name.label"
      placeholder="forms.group.name.placeholder"
      iconName="label"
      modifiers={[fillMaxWidth()]}
      isError={isInvalid}
      onValueChange={field.handleChange}
      errors={field.state.meta.errors}
    />
  );
}

function DescriptionInput({ field }: InputProps<string>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <TextInput
      value={field.state.value}
      label="forms.group.description.label"
      placeholder="forms.group.description.placeholder"

      modifiers={[fillMaxWidth()]}
      isError={isInvalid}
      onValueChange={field.handleChange}
      errors={field.state.meta.errors}
      minLines={5}
    />
  );
}

function PermissionsInput({
  isSelected,
  toggleAllFromResource,
  togglePermission,
  field,
  counts,
}: PermissionsFieldChildrenProps) {
  const { t } = useTranslation();
  const colors = useThemeColor();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;
  return (
    <Column
      verticalArrangement={{
        spacedBy: SPACING.md,
      }}
    >
      {isInvalid && <FieldError>{errors}</FieldError>}
      {Object.keys(PERMISSIONS).map((resource) => {
        const count = counts[resource as Resource];

        const nameKey = `permissions.${resource as Resource}.name` as const;
        const name = t(nameKey);

        return (
          <Accordion label={name} key={resource}>
            <Column
              verticalArrangement={{
                spacedBy: SPACING.sm,
              }}
            >
              <Row
                modifiers={[
                  clickable(() => toggleAllFromResource(resource as Resource)),
                  padding(SPACING.md, SPACING.sm, SPACING.md, SPACING.sm),
                ]}
              >
                <Column>
                  <ThemedNativeText>
                    {t("helpers.all_of", {
                      label: name,
                    })}
                  </ThemedNativeText>
                </Column>
                <Spacer modifiers={[weight(1)]} />
                <Checkbox
                  value={count.selected === count.total}
                  colors={{
                    checkedColor: colors.primary,
                  }}
                />
              </Row>
              {PERMISSIONS[resource as Resource].map((action) => {
                const permission = `${resource}:${action}` as Permission;

                const actionKey =
                  `permissions.${resource}.${action}.name` as TranslationKey;
                const actionDescriptionKey =
                  `permissions.${resource}.${action}.description` as TranslationKey;

                return (
                  <Row
                    key={permission}
                    modifiers={[
                      clickable(() => togglePermission(permission)),
                      padding(SPACING.md, SPACING.sm, SPACING.md, SPACING.sm),
                    ]}
                  >
                    <Column>
                      <ThemedNativeText>{t(actionKey)}</ThemedNativeText>
                      <ThemedNativeText variant="muted">
                        {t(actionDescriptionKey)}
                      </ThemedNativeText>
                    </Column>
                    <Spacer modifiers={[weight(1)]} />
                    <Checkbox
                      value={isSelected(permission)}
                      colors={{
                        checkedColor: colors.primary,
                      }}
                    />
                  </Row>
                );
              })}
            </Column>
          </Accordion>
        );
      })}
    </Column>
  );
}

export const GroupFormInputs = {
  NameInput,
  DescriptionInput,
  PermissionsInput,
};
