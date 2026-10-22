import AccountBalanceWalletIcon from "@expo/material-symbols/account_balance_wallet.xml";
import AddIcon from "@expo/material-symbols/add.xml";
import AddBusinessIcon from "@expo/material-symbols/add_business.xml";
import AddCircleIcon from "@expo/material-symbols/add_circle.xml";
import ApartmentIcon from "@expo/material-symbols/apartment.xml";
import ArrowDownwardIcon from "@expo/material-symbols/arrow_downward.xml";
import ArrowDropDownIcon from "@expo/material-symbols/arrow_drop_down.xml";
import ArrowForwardIcon from "@expo/material-symbols/arrow_forward.xml";
import AssignMentReturnIcon from "@expo/material-symbols/assignment_return.xml";
import AttachMoneyIcon from "@expo/material-symbols/attach_money.xml";
import BadgeIcon from "@expo/material-symbols/badge.xml";
import BarcodeIcon from "@expo/material-symbols/barcode.xml";
import BarcodeScannerIcon from "@expo/material-symbols/barcode_scanner.xml";
import BlockIcon from "@expo/material-symbols/block.xml";
import CallIcon from "@expo/material-symbols/call.xml";
import CheckIcon from "@expo/material-symbols/check.xml";
import CheckCircleIcon from "@expo/material-symbols/check_circle.xml";
import ChevronRightIcon from "@expo/material-symbols/chevron_right.xml";
import CloseIcon from "@expo/material-symbols/close.xml";
import ConveyorBeltIcon from "@expo/material-symbols/conveyor_belt.xml";
import CreditCardIcon from "@expo/material-symbols/credit_card.xml";
import DeleteIcon from "@expo/material-symbols/delete.xml";
import DescriptionIcon from "@expo/material-symbols/description.xml";
import DoNotDisturbOnIcon from "@expo/material-symbols/do_not_disturb_on.xml";
import EditIcon from "@expo/material-symbols/edit.xml";
import ErrorIcon from "@expo/material-symbols/error.xml";
import EventIcon from "@expo/material-symbols/event.xml";
import ExpandIcon from "@expo/material-symbols/expand.xml";
import FilterListIcon from "@expo/material-symbols/filter_list.xml";
import GroupIcon from "@expo/material-symbols/group.xml";
import GroupAddIcon from "@expo/material-symbols/group_add.xml";
import InventoryIcon from "@expo/material-symbols/inventory.xml";
import Inventory2Icon from "@expo/material-symbols/inventory_2.xml";
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
import SearchIcon from "@expo/material-symbols/search.xml";
import SecurityIcon from "@expo/material-symbols/security.xml";
import SwitchLeftIcon from "@expo/material-symbols/switch_left.xml";
import SyncIcon from "@expo/material-symbols/sync.xml";
import ViewListIcon from "@expo/material-symbols/view_list.xml";
import VisibilityIcon from "@expo/material-symbols/visibility.xml";
import { Icon as ExpoIcon, type IconProps as ExpoIconProps } from "@expo/ui";

export const ICONS = {
  error: ExpoIcon.select({
    android: ErrorIcon,
    ios: "exclamationmark.circle.fill",
  }),
  event: ExpoIcon.select({
    android: EventIcon,
    ios: "calendar",
  }),
  "add-business": ExpoIcon.select({
    android: AddBusinessIcon,
    ios: "storefront",
  }),
  apartment: ExpoIcon.select({
    android: ApartmentIcon,
    ios: "building.2",
  }),
  "account-balance-wallet": ExpoIcon.select({
    android: AccountBalanceWalletIcon,
    ios: "wallet.pass",
  }),
  badge: ExpoIcon.select({
    android: BadgeIcon,
    ios: "person.text.rectangle",
  }),
  call: ExpoIcon.select({
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
  "location-on": ExpoIcon.select({
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
  "check-circle": ExpoIcon.select({
    android: CheckCircleIcon,
    ios: "checkmark.circle",
  }),
  visibility: ExpoIcon.select({
    android: VisibilityIcon,
    ios: "eye",
  }),
  edit: ExpoIcon.select({
    android: EditIcon,
    ios: "pencil",
  }),
  "group-add": ExpoIcon.select({
    android: GroupAddIcon,
    ios: "eraser",
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
  "conveyor-belt": ExpoIcon.select({
    android: ConveyorBeltIcon,
    ios: "eraser",
  }),
  "do-not-disturb-on": ExpoIcon.select({
    android: DoNotDisturbOnIcon,
    ios: "minus.circle.fill",
  }),
  inventory: ExpoIcon.select({
    android: InventoryIcon,
    ios: "shippingbox",
  }),
  "add-circle": ExpoIcon.select({
    android: AddCircleIcon,
    ios: "plus.circle",
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
  "view-list": ExpoIcon.select({
    android: ViewListIcon,
    ios: "list.bullet",
  }),
  group: ExpoIcon.select({
    android: GroupIcon,
    ios: "person.2",
  }),
  sync: ExpoIcon.select({
    android: SyncIcon,
    ios: "arrow.triangle.2.circlepath",
  }),
  inventory_2: ExpoIcon.select({
    android: Inventory2Icon,
    ios: "archivebox",
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
  "attach-money": ExpoIcon.select({
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
} as const;

export type IconName = keyof typeof ICONS;

type Props = Omit<ExpoIconProps, "name"> & {
  name: IconName;
};

export function Icon({ name, ...rest }: Props) {
  return <ExpoIcon name={ICONS[name]} {...rest} />;
}
