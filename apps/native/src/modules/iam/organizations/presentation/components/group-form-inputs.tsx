import { CommonInput } from "@/modules/shared/components/common-input";
import { FieldError } from "@/modules/shared/components/field-error";
import type {
  PermissionsFieldChildrenProps,
  ChildrenProps,
} from "@fludge/client/presentation/iam/organization/group.form";
import { PERMISSIONS, type RESOURCES } from "@fludge/utils/permissions/data";
import { Accordion } from "heroui-native/accordion";
import { Card } from "heroui-native/card";
import { Checkbox } from "heroui-native/checkbox";
import { Chip } from "heroui-native/chip";
import { ControlField } from "heroui-native/control-field";
import { Label } from "heroui-native/label";
import { Separator } from "heroui-native/separator";
import { Typography } from "heroui-native/text";
import { View } from "react-native";

function GroupNameInput({ isInvalid, id, field }: ChildrenProps<string>) {
  return (
    <CommonInput
      isRequired
      isInvalid={isInvalid}
      errors={field.state.meta.errors}
      label="Nombre"
      icon="security"
      inputProps={{
        id,
        value: field.state.value,
        onBlur: field.handleBlur,
        onChangeText: field.handleChange,
        placeholder: "Ej. Bodega",
      }}
    />
  );
}

function PermissionsListInput({
  toggle,
  check,
  toggleAll,
  counts,
  isInvalid,
  field,
}: PermissionsFieldChildrenProps) {
  return (
    <View>
      <View>
        <Typography.Heading type="h4">Matriz de permisos</Typography.Heading>
        {isInvalid && <FieldError errors={field.state.meta.errors} />}
      </View>
      <Accordion variant="surface">
        {Object.keys(PERMISSIONS).map((resource) => {
          const count = counts[resource as RESOURCES];

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
                  onPress={() => toggleAll(resource as RESOURCES)}
                  isSelected={count.selected === count.total}
                >
                  <View className="flex-1 flex-row justify-between p-4">
                    <Label>Todos de {resource}</Label>
                    <ControlField.Indicator>
                      <Checkbox
                        className="bg-accent"
                        onPress={() => toggleAll(resource as RESOURCES)}
                      />
                    </ControlField.Indicator>
                  </View>
                </ControlField>
                <Separator />
                {PERMISSIONS[resource as RESOURCES].map((action) => (
                  <ControlField
                    key={`${resource}:${action}`}
                    onPress={() => toggle(resource as RESOURCES, action)}
                    isSelected={check(resource as RESOURCES, action)}
                  >
                    <Card className="bg-surface-tertiary flex-1 flex-row justify-between">
                      <Label>{action}</Label>
                      <ControlField.Indicator>
                        <Checkbox
                          className="bg-accent"
                          onPress={() => toggle(resource as RESOURCES, action)}
                        />
                      </ControlField.Indicator>
                    </Card>
                  </ControlField>
                ))}
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
