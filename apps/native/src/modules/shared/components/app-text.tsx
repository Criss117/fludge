import { cn } from "heroui-native";
import { Text as RNText, type TextProps as RNTextProps } from "react-native";

export function Text(props: RNTextProps) {
  return <RNText {...props} className={cn("font-normal", props.className)} />;
}
