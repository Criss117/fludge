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
import AddIcon from "@expo/material-symbols/add.xml";
import MoreVertIcon from "@expo/material-symbols/more_vert.xml";
import PersonIcon from "@expo/material-symbols/person.xml";
import CheckIcon from "@expo/material-symbols/check.xml";
import CheckCircleIcon from "@expo/material-symbols/check_circle.xml";
import VisibilityIcon from "@expo/material-symbols/visibility.xml";
import EditIcon from "@expo/material-symbols/edit.xml";
import GroupAddIcon from "@expo/material-symbols/group_add.xml";
import LabelIcon from "@expo/material-symbols/label.xml";
import DescriptionIcon from "@expo/material-symbols/description.xml";
import ArrowDropDownIcon from "@expo/material-symbols/arrow_drop_down.xml";

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
  "more-vert": MoreVertIcon,
  add: AddIcon,
  person: PersonIcon,
  check: CheckIcon,
  "check-circle": CheckCircleIcon,
  visibility: VisibilityIcon,
  edit: EditIcon,
  "group-add": GroupAddIcon,
  label: LabelIcon,
  description: DescriptionIcon,
  "arrow-drop-down": ArrowDropDownIcon,
} as const;

export type IconName = keyof typeof ICONS;

type Props = Omit<ExpoIconProps, "name"> & {
  name: IconName;
};

export function Icon({ name, ...rest }: Props) {
  return <ExpoIcon name={ICONS[name]} {...rest} />;
}
