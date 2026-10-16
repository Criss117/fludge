import AddIcon from "@expo/material-symbols/add.xml";
import AddBusinessIcon from "@expo/material-symbols/add_business.xml";
import AddCircleIcon from "@expo/material-symbols/add_circle.xml";
import ApartmentIcon from "@expo/material-symbols/apartment.xml";
import ArrowDownwardIcon from "@expo/material-symbols/arrow_downward.xml";
import ArrowDropDownIcon from "@expo/material-symbols/arrow_drop_down.xml";
import ArrowForwardIcon from "@expo/material-symbols/arrow_forward.xml";
import BadgeIcon from "@expo/material-symbols/badge.xml";
import BarcodeIcon from "@expo/material-symbols/barcode.xml";
import BarcodeScannerIcon from "@expo/material-symbols/barcode_scanner.xml";
import BlockIcon from "@expo/material-symbols/block.xml";
import CallIcon from "@expo/material-symbols/call.xml";
import CheckIcon from "@expo/material-symbols/check.xml";
import CheckCircleIcon from "@expo/material-symbols/check_circle.xml";
import CloseIcon from "@expo/material-symbols/close.xml";
import ConveyorBeltIcon from "@expo/material-symbols/conveyor_belt.xml";
import DeleteIcon from "@expo/material-symbols/delete.xml";
import DescriptionIcon from "@expo/material-symbols/description.xml";
import DoNotDisturbOnIcon from "@expo/material-symbols/do_not_disturb_on.xml";
import EditIcon from "@expo/material-symbols/edit.xml";
import ErrorIcon from "@expo/material-symbols/error.xml";
import GroupIcon from "@expo/material-symbols/group.xml";
import GroupAddIcon from "@expo/material-symbols/group_add.xml";
import InventoryIcon from "@expo/material-symbols/inventory.xml";
import Inventory2Icon from "@expo/material-symbols/inventory_2.xml";
import LabelIcon from "@expo/material-symbols/label.xml";
import LocationOnIcon from "@expo/material-symbols/location_on.xml";
import LogoutIcon from "@expo/material-symbols/logout.xml";
import MailIcon from "@expo/material-symbols/mail.xml";
import MoreVertIcon from "@expo/material-symbols/more_vert.xml";
import PasswordIcon from "@expo/material-symbols/password.xml";
import PersonIcon from "@expo/material-symbols/person.xml";
import RemoveIcon from "@expo/material-symbols/remove.xml";
import SearchIcon from "@expo/material-symbols/search.xml";
import SecurityIcon from "@expo/material-symbols/security.xml";
import SwitchLeftIcon from "@expo/material-symbols/switch_left.xml";
import SyncIcon from "@expo/material-symbols/sync.xml";
import ViewListIcon from "@expo/material-symbols/view_list.xml";
import VisibilityIcon from "@expo/material-symbols/visibility.xml";
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
  block: BlockIcon,
  "barcode-scanner": BarcodeScannerIcon,
  "conveyor-belt": ConveyorBeltIcon,
  "do-not-disturb-on": DoNotDisturbOnIcon,
  inventory: InventoryIcon,
  "arrow-downward": ArrowDownwardIcon,
  "add-circle": AddCircleIcon,
  barcode: BarcodeIcon,
  delete: DeleteIcon,
  security: SecurityIcon,
  "view-list": ViewListIcon,
  group: GroupIcon,
  sync: SyncIcon,
  inventory_2: Inventory2Icon,
  logout: LogoutIcon,
  switch: SwitchLeftIcon,
  "arrow-forward": ArrowForwardIcon,
  remove: RemoveIcon,
} as const;

export type IconName = keyof typeof ICONS;

type Props = Omit<ExpoIconProps, "name"> & {
  name: IconName;
};

export function Icon({ name, ...rest }: Props) {
  return <ExpoIcon name={ICONS[name]} {...rest} />;
}
