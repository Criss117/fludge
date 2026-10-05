import ErrorIcon from "@expo/material-symbols/error.xml";
import { Icon as ExpoIcon, type IconProps as ExpoIconProps } from "@expo/ui";

export const ICONS = {
  error: ErrorIcon,
} as const;

export type IconName = keyof typeof ICONS;

type Props = Omit<ExpoIconProps, "name"> & {
  name: IconName;
};

export function Icon({ name, ...rest }: Props) {
  return <ExpoIcon name={ICONS[name]} {...rest} />;
}
