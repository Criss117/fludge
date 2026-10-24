import type { TranslationKey } from "@fludge/i18n/index";

import type { IconName } from "@/core/shared/components/icon";
import type { Colors } from "@/lib/theme";

export type MenuOptionItem = {
  label: TranslationKey;
  action: () => void;
  icon: IconName;
  color?: keyof Colors;
};

export interface MenuOptionsProps {
  items: MenuOptionItem[];
  isExpanded?: boolean;
  onExpandChange?: (isExpanded: boolean) => void;
}
