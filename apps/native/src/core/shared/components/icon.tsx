import ErrorIcon from "@expo/material-symbols/error.xml";
import AddBusinessIcon from "@expo/material-symbols/add_business.xml";
import ApartmentIcon from "@expo/material-symbols/apartment.xml";
import BadgeIcon from "@expo/material-symbols/badge.xml";
import CallIcon from "@expo/material-symbols/call.xml";
import PasswordIcon from "@expo/material-symbols/password.xml";
import MailIcon from "@expo/material-symbols/mail.xml";
import CloseIcon from "@expo/material-symbols/close.xml";
import SearchIcon from "@expo/material-symbols/search.xml";
import LocationOnIcon from "@expo/material-symbols/location_on.xml";
import { Icon as ExpoIcon, type IconProps as ExpoIconProps } from "@expo/ui";

export const ICONS = {
  error: ErrorIcon,
  "add-business": AddBusinessIcon,
  apartment: ApartmentIcon,
  badge: BadgeIcon,
  call: CallIcon,
  password: PasswordIcon,
  mail: MailIcon,
  close: CloseIcon,
  search: SearchIcon,
  "location-on": LocationOnIcon,
} as const;

export type IconName = keyof typeof ICONS;

type Props = Omit<ExpoIconProps, "name"> & {
  name: IconName;
};

export function Icon({ name, ...rest }: Props) {
  return <ExpoIcon name={ICONS[name]} {...rest} />;
}
