import AddIcon from "@expo/material-symbols/add.xml";
import ApartmentIcon from "@expo/material-symbols/apartment.xml";
import ArrowDownwardIcon from "@expo/material-symbols/arrow_downward.xml";
import ArrowDropDownIcon from "@expo/material-symbols/arrow_drop_down.xml";
import ArrowDropUpIcon from "@expo/material-symbols/arrow_drop_up.xml";
import ArrowForwardIcon from "@expo/material-symbols/arrow_forward.xml";
import AssignMentReturnIcon from "@expo/material-symbols/assignment_return.xml";
import AttachMoneyIcon from "@expo/material-symbols/attach_money.xml";
import BadgeIcon from "@expo/material-symbols/badge.xml";
import BarcodeIcon from "@expo/material-symbols/barcode.xml";
import BarcodeScannerIcon from "@expo/material-symbols/barcode_scanner.xml";
import BlockIcon from "@expo/material-symbols/block.xml";
import CallIcon from "@expo/material-symbols/call.xml";
import CheckIcon from "@expo/material-symbols/check.xml";
import ChevronRightIcon from "@expo/material-symbols/chevron_right.xml";
import CloseIcon from "@expo/material-symbols/close.xml";
import CreditCardIcon from "@expo/material-symbols/credit_card.xml";
import DeleteIcon from "@expo/material-symbols/delete.xml";
import DescriptionIcon from "@expo/material-symbols/description.xml";
import DomainAddIcon from "@expo/material-symbols/domain_add.xml";
import EditIcon from "@expo/material-symbols/edit.xml";
import ErrorIcon from "@expo/material-symbols/error.xml";
import ExpandIcon from "@expo/material-symbols/expand.xml";
import FilterListIcon from "@expo/material-symbols/filter_list.xml";
import GroupIcon from "@expo/material-symbols/group.xml";
import GroupAddIcon from "@expo/material-symbols/group_add.xml";
import InventoryIcon from "@expo/material-symbols/inventory.xml";
import KeyboardArrowDownIcon from "@expo/material-symbols/keyboard_arrow_down.xml";
import KeyboardArrowUpIcon from "@expo/material-symbols/keyboard_arrow_up.xml";
import LabelIcon from "@expo/material-symbols/label.xml";
import LocationOnIcon from "@expo/material-symbols/location_on.xml";
import LogoutIcon from "@expo/material-symbols/logout.xml";
import MailIcon from "@expo/material-symbols/mail.xml";
import MoreVertIcon from "@expo/material-symbols/more_vert.xml";
import PasswordIcon from "@expo/material-symbols/password.xml";
import PaymentsIcon from "@expo/material-symbols/payments.xml";
import PersonIcon from "@expo/material-symbols/person.xml";
import PersonAddIcon from "@expo/material-symbols/person_add.xml";
import PointOfSaleIcon from "@expo/material-symbols/point_of_sale.xml";
import ReceiptLongIcon from "@expo/material-symbols/receipt_long.xml";
import RemoveIcon from "@expo/material-symbols/remove.xml";
import SaveIcon from "@expo/material-symbols/save.xml";
import SearchIcon from "@expo/material-symbols/search.xml";
import SecurityIcon from "@expo/material-symbols/security.xml";
import SettingsIcon from "@expo/material-symbols/settings.xml";
import SwitchLeftIcon from "@expo/material-symbols/switch_left.xml";
import SyncIcon from "@expo/material-symbols/sync.xml";
import VisibilityIcon from "@expo/material-symbols/visibility.xml";
import { Icon as ExpoIcon, type IconProps as ExpoIconProps } from "@expo/ui";

export const ICONS = {
  error: ExpoIcon.select({
    android: ErrorIcon,
    ios: "exclamationmark.circle.fill",
  }),
  save: ExpoIcon.select({
    android: SaveIcon,
    ios: "exclamationmark.circle.fill",
  }),

  "user-name": ExpoIcon.select({
    android: BadgeIcon,
    ios: "person.text.rectangle",
  }),
  phone: ExpoIcon.select({
    android: CallIcon,
    ios: "phone",
  }),
  password: ExpoIcon.select({
    android: PasswordIcon,
    ios: "ellipsis.rectangle",
  }),
  mail: ExpoIcon.select({
    android: MailIcon,
    ios: "envelope",
  }),
  close: ExpoIcon.select({
    android: CloseIcon,
    ios: "xmark",
  }),
  search: ExpoIcon.select({
    android: SearchIcon,
    ios: "magnifyingglass",
  }),
  location: ExpoIcon.select({
    android: LocationOnIcon,
    ios: "mappin",
  }),
  "more-vert": ExpoIcon.select({
    android: MoreVertIcon,
    ios: "ellipsis",
  }),
  add: ExpoIcon.select({
    android: AddIcon,
    ios: "plus",
  }),
  person: ExpoIcon.select({
    android: PersonIcon,
    ios: "person",
  }),
  "person-add": ExpoIcon.select({
    android: PersonAddIcon,
    ios: "person.badge.plus",
  }),
  check: ExpoIcon.select({
    android: CheckIcon,
    ios: "checkmark",
  }),
  eye: ExpoIcon.select({
    android: VisibilityIcon,
    ios: "eye",
  }),
  "eye-off": ExpoIcon.select({
    android: VisibilityIcon,
    ios: "eye",
  }),
  edit: ExpoIcon.select({
    android: EditIcon,
    ios: "pencil",
  }),
  label: ExpoIcon.select({
    android: LabelIcon,
    ios: "tag",
  }),
  description: ExpoIcon.select({
    android: DescriptionIcon,
    ios: "doc.text",
  }),
  "arrow-drop-down": ExpoIcon.select({
    android: ArrowDropDownIcon,
    ios: "arrowtriangle.down.fill",
  }),
  "arrow-drop-up": ExpoIcon.select({
    android: ArrowDropUpIcon,
    ios: "arrowtriangle.down.fill",
  }),
  "arrow-forward": ExpoIcon.select({
    android: ArrowForwardIcon,
    ios: "arrow.right",
  }),
  "arrow-downward": ExpoIcon.select({
    android: ArrowDownwardIcon,
    ios: "arrow.down",
  }),
  block: ExpoIcon.select({
    android: BlockIcon,
    ios: "nosign",
  }),
  "barcode-scanner": ExpoIcon.select({
    android: BarcodeScannerIcon,
    ios: "barcode.viewfinder",
  }),
  inventory: ExpoIcon.select({
    android: InventoryIcon,
    ios: "shippingbox",
  }),
  barcode: ExpoIcon.select({
    android: BarcodeIcon,
    ios: "barcode",
  }),
  delete: ExpoIcon.select({
    android: DeleteIcon,
    ios: "trash",
  }),
  security: ExpoIcon.select({
    android: SecurityIcon,
    ios: "lock.shield",
  }),
  sync: ExpoIcon.select({
    android: SyncIcon,
    ios: "arrow.triangle.2.circlepath",
  }),
  logout: ExpoIcon.select({
    android: LogoutIcon,
    ios: "rectangle.portrait.and.arrow.right",
  }),
  switch: ExpoIcon.select({
    android: SwitchLeftIcon,
    ios: "arrow.left.arrow.right",
  }),
  remove: ExpoIcon.select({
    android: RemoveIcon,
    ios: "minus",
  }),
  dollar: ExpoIcon.select({
    android: AttachMoneyIcon,
    ios: "dollarsign",
  }),
  payments: ExpoIcon.select({
    android: PaymentsIcon,
    ios: "banknote",
  }),
  "point-of-sale": ExpoIcon.select({
    android: PointOfSaleIcon,
    ios: "creditcard.and.123",
  }),
  "assignment-return": ExpoIcon.select({
    android: AssignMentReturnIcon,
    ios: "arrow.uturn.backward",
  }),
  "credit-card": ExpoIcon.select({
    android: CreditCardIcon,
    ios: "creditcard",
  }),
  "chevron-right": ExpoIcon.select({
    android: ChevronRightIcon,
    ios: "chevron.right",
  }),
  expand: ExpoIcon.select({
    android: ExpandIcon,
    ios: "arrow.up.and.down",
  }),
  receipt: ExpoIcon.select({
    android: ReceiptLongIcon,
    ios: "receipt",
  }),
  "filter-list": ExpoIcon.select({
    android: FilterListIcon,
    ios: "line.3.horizontal.decrease",
  }),
  "keyboard-arrow-down": ExpoIcon.select({
    android: KeyboardArrowDownIcon,
    ios: "chevron.down",
  }),
  "keyboard-arrow-up": ExpoIcon.select({
    android: KeyboardArrowUpIcon,
    ios: "chevron.up",
  }),
  settings: ExpoIcon.select({
    android: SettingsIcon,
    ios: "gear",
  }),

  organization: ExpoIcon.select({
    android: ApartmentIcon,
    ios: "building.2",
  }),
  "add-organization": ExpoIcon.select({
    android: DomainAddIcon,
    ios: "building.2",
  }),

  customers: ExpoIcon.select({
    android: GroupIcon,
    ios: "plus",
  }),
  "add-customer": ExpoIcon.select({
    android: GroupAddIcon,
    ios: "plus",
  }),

  members: ExpoIcon.select({
    android: GroupIcon,
    ios: "person.2",
  }),
} as const;

export type iconName = keyof typeof ICONS;

type Props = Omit<ExpoIconProps, "name"> & {
  name: iconName;
};

export function Icon({ name, ...rest }: Props) {
  return <ExpoIcon name={ICONS[name]} {...rest} />;
}
