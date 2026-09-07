import { MaterialIcons } from "@/modules/shared/components/icons";
import { Chip } from "heroui-native/chip";
import { useTranslation } from "react-i18next";

interface IsCriticalStockProps {
  stock: number;
  minStock: number;
  allowNegativeStock?: boolean;
  percent?: number;
}

export function IsCriticalStock({
  stock,
  minStock,
  allowNegativeStock,
  percent = 1.2,
}: IsCriticalStockProps) {
  const { t } = useTranslation();

  if (allowNegativeStock) return null;

  switch (true) {
    case stock <= minStock:
      return (
        <Chip className="bg-danger-soft">
          <MaterialIcons
            name="circle-notifications"
            size={14}
            className="text-danger"
          />
          <Chip.Label className="text-danger">
            {t("screens.products.product.sections.details.critical_stock")}
          </Chip.Label>
        </Chip>
      );
    case stock <= minStock * percent:
      return (
        <Chip className="bg-amber-100">
          <MaterialIcons
            name="keyboard-double-arrow-down"
            size={14}
            className="text-amber-400"
          />
          <Chip.Label className="text-amber-400">
            {t("screens.products.product.sections.details.low_stock")}
          </Chip.Label>
        </Chip>
      );
    default:
      return null;
  }
}
