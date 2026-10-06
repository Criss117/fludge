import { AssistChip } from "@expo/ui/jetpack-compose";
import { ThemedNativeText } from "./themed-text";
import { useThemeColor } from "../hooks/use-theme-color";
import { useTranslation } from "react-i18next";
import { Icon } from "./icon";

interface Props {
  status: "active" | "inactive" | "discontinued";
}

const styles = {
  active: {
    primary: "success",
    secondary: "onSuccess",
    icon: "check",
  },
  inactive: {
    primary: "surface",
    secondary: "onSurface",
    icon: "close",
  },
  discontinued: {
    primary: "success",
    secondary: "onSuccess",
    icon: "close",
  },
} as const;

export function StatusChip({ status }: Props) {
  const colors = useThemeColor();
  const { t } = useTranslation();

  const s = styles[status];

  return (
    <AssistChip
      colors={{
        containerColor: colors[s.primary],
        labelColor: colors[s.secondary],
        leadingIconContentColor: colors[s.secondary],
        trailingIconContentColor: colors[s.secondary],
      }}
    >
      <AssistChip.LeadingIcon>
        <Icon name={s.icon} size={18} color={colors[s.secondary]} />
      </AssistChip.LeadingIcon>
      <AssistChip.Label>
        <ThemedNativeText color={colors[s.secondary]}>
          {t(`helpers.status.${status}`)}
        </ThemedNativeText>
      </AssistChip.Label>
    </AssistChip>
  );
}
