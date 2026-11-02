import { Host } from "@expo/ui/jetpack-compose";
import { fillMaxWidth } from "@expo/ui/jetpack-compose/modifiers";

import { TextInput } from "@/core/shared/components/text-input";

import type { AmountInputProps } from "./types";

export function AmountInput({ amount, setAmount }: AmountInputProps) {
  return (
    <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
      <TextInput
        type="number"
        defaultValue={amount}
        onValueChange={setAmount}
        label="screens.charge.sections.amount_received.label"
        placeholder="screens.charge.sections.amount_received.placeholder"
        iconName="dollar"
        modifiers={[fillMaxWidth()]}
      />
    </Host>
  );
}
