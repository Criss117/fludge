import { Column, ElevatedCard } from "@expo/ui/jetpack-compose";
import { fillMaxWidth, paddingAll } from "@expo/ui/jetpack-compose/modifiers";
import { useThemeColor } from "../hooks/use-theme-color";
import { SPACING } from "@/lib/sp";
import { ThemedNativeText } from "./themed-text";
import { useTranslation } from "react-i18next";
import type { TranslationKey } from "@fludge/i18n/index";

interface Props {
  title: TranslationKey;
  description?: TranslationKey;
  children: React.ReactNode;
}

export function SectionCard({ title, description, children }: Props) {
  const colors = useThemeColor();
  const { t } = useTranslation();

  return (
    <ElevatedCard
      modifiers={[fillMaxWidth()]}
      colors={{
        containerColor: colors.onSecondary,
      }}
    >
      <Column
        modifiers={[paddingAll(SPACING.md)]}
        verticalArrangement={{
          spacedBy: SPACING.md,
        }}
      >
        <Column>
          <ThemedNativeText variant="h5">{t(title)}</ThemedNativeText>
          {description && (
            <ThemedNativeText variant="muted">
              {t(description)}
            </ThemedNativeText>
          )}
        </Column>
        {children}
      </Column>
    </ElevatedCard>
  );
}
