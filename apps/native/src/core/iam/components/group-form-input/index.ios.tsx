import type { PermissionsFieldChildrenProps } from "@fludge/client/iam/forms/group.form";

import { TextInput } from "@/core/shared/components/text-input";
import type { InputProps } from "@/core/shared/components/text-input/types";

function NameInput({ field }: InputProps<string>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <TextInput
      label="forms.group.name.label"
      placeholder="forms.group.name.placeholder"
      iconName="label"
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
      label="forms.group.description.label"
      placeholder="forms.group.description.placeholder"
      isError={isInvalid}
      onValueChange={field.handleChange}
      errors={field.state.meta.errors}
      minLines={5}
    />
  );
}

function PermissionsInput(props: PermissionsFieldChildrenProps) {
  return null;
}

export const GroupFormInputs = {
  NameInput,
  DescriptionInput,
  PermissionsInput,
};
