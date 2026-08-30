import type { MemberSummary } from "@fludge/client/application/iam/organization/queries/use-find-members";
import { Checkbox, cn } from "heroui-native";
import { PressableFeedback } from "heroui-native/pressable-feedback";
import { View } from "react-native";
import { MemberCardBase } from ".";

interface Props {
  member: MemberSummary;
  onPress?: (member: MemberSummary) => void;
  onLongPress?: (member: MemberSummary) => void;
  isSelected?: boolean;
  hideOptions?: boolean;
}

export function SelectableMemberCard({
  member,
  onPress,
  onLongPress,
  isSelected,
  hideOptions,
}: Props) {
  return (
    <PressableFeedback
      onPress={() => onPress?.(member)}
      onLongPress={() => onLongPress?.(member)}
    >
      <View
        className={cn(
          "relative rounded-3xl border",
          isSelected ? "border-foreground" : "border-transparent",
        )}
      >
        <Checkbox
          onPress={() => onPress?.(member)}
          className="bg-accent absolute top-4 right-4 z-50"
          isSelected={isSelected}
        />
        <MemberCardBase member={member} hideOptions={hideOptions} />
      </View>
    </PressableFeedback>
  );
}
