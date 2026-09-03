import { CommonInput } from "@/modules/shared/components/common-input";
import { FieldError } from "@/modules/shared/components/field-error";
import type {
  PermissionsFieldChildrenProps,
  ChildrenProps,
} from "@fludge/client/presentation/iam/organization/group.form";
import {
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

function GroupNameInput({ isInvalid, id, field }: ChildrenProps<string>) {
  return (
    <CommonInput
      isRequired
      isInvalid={isInvalid}
      errors={field.state.meta.errors}
      label="inputs.group.name.label"
      icon="security"
      inputProps={{
        id,
        value: field.state.value,
        onBlur: field.handleBlur,
        onChangeText: field.handleChange,
        placeholder: "inputs.group.name.placeholder",
      }}
    />
  );
}

function PermissionsListInput({
  isSelected,
  toggleAllFromResource,
  togglePermission,
  isInvalid,
  field,
  counts,
}: PermissionsFieldChildrenProps) {
  const { t } = useTranslation();

  return (
    <View>
      <View>
        <Typography.Heading type="h4">
          {t("inputs.group.permissions.label")}
        </Typography.Heading>
        {isInvalid && <FieldError errors={field.state.meta.errors} />}
      </View>
      <Accordion variant="surface">
        {Object.keys(PERMISSIONS).map((resource) => {
          const count = counts[resource as Resource];

          return (
            <Accordion.Item key={resource} value={resource}>
              <Accordion.Trigger>
                <Typography>{resource}</Typography>
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
                    <Label>Todos de {resource}</Label>
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

                  return (
                    <ControlField
                      key={`${resource}:${action}`}
                      onPress={() => togglePermission(permission)}
                      isSelected={isSelected(permission)}
                    >
                      <Card className="bg-surface-tertiary flex-1 flex-row justify-between">
                        <Label>{action}</Label>
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
  GroupNameInput,
  PermissionsListInput,
};
