import { Card, Column, Host, Row } from "@expo/ui/jetpack-compose";
import { paddingAll, weight } from "@expo/ui/jetpack-compose/modifiers";
import type { CategorySummary } from "@fludge/client/catalog/domain/category.repository";

import { MenuOptions } from "@/core/shared/components/menu-options";
import { StatusChip } from "@/core/shared/components/status-chip";
import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

interface Props {
  category: CategorySummary;
  onUpdate: (category: CategorySummary) => void;
  onToggleStatus: (category: CategorySummary) => void;
}

const CARD_HEIGHT = 96;

export function CategoryCard({ category, onUpdate, onToggleStatus }: Props) {
  const colors = useThemeColor();

  return (
    <Host style={{ width: "100%", height: CARD_HEIGHT }}>
      <Card
        colors={{
          containerColor: colors.onSecondary,
        }}
      >
        <Column modifiers={[paddingAll(SPACING.md)]}>
          <Row horizontalAlignment="center">
            <Column modifiers={[weight(1)]}>
              <ThemedNativeText variant="h5" maxLines={1}>
                {category.name}
              </ThemedNativeText>
              {category.description ? (
                <ThemedNativeText variant="muted" maxLines={2}>
                  {category.description}
                </ThemedNativeText>
              ) : null}
            </Column>
            <StatusChip status={category.status} />
            <MenuOptions
              items={[
                {
                  label: "helpers.navigation.update",
                  action: () => onUpdate(category),
                  icon: "edit",
                },
                {
                  label:
                    category.status === "active"
                      ? "helpers.status.deactivate"
                      : "helpers.status.activate",
                  action: () => onToggleStatus(category),
                  icon: category.status === "active" ? "block" : "check",
                },
              ]}
            />
          </Row>
        </Column>
      </Card>
    </Host>
  );
}
