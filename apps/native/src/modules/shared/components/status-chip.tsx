import { Chip } from "heroui-native/chip";
import { MaterialIcons } from "./icons";
import { useTranslation } from "react-i18next";

export function StatusChip({
  status,
}: {
  status: "active" | "discontinued" | "inactive";
}) {
  switch (status) {
    case "active":
      return <ActiveStatusChip />;
    case "discontinued":
      return <DiscontinuedStatusChip />;
    case "inactive":
      return <InactiveStatusChip />;
  }
}

function ActiveStatusChip() {
  const { t } = useTranslation();

  return (
    <Chip className="bg-success/20 border-success border">
      <MaterialIcons name="check-circle" className="text-success" />
      <Chip.Label className="text-success">
        {t("helpers.status.active")}
      </Chip.Label>
    </Chip>
  );
}

function DiscontinuedStatusChip() {
  const { t } = useTranslation();

  return (
    <Chip className="border border-amber-400 bg-amber-100">
      <MaterialIcons name="cancel" className="text-amber-600" />
      <Chip.Label className="text-amber-600">
        {t("helpers.status.discontinued")}
      </Chip.Label>
    </Chip>
  );
}

function InactiveStatusChip() {
  const { t } = useTranslation();

  return (
    <Chip variant="secondary">
      <MaterialIcons name="cancel" className="text-muted" />
      <Chip.Label>{t("helpers.status.inactive")}</Chip.Label>
    </Chip>
  );
}
