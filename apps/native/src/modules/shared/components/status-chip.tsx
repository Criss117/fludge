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
    <Chip className="bg-green-500">
      <MaterialIcons name="check-circle" className="text-eclipse" />
      <Chip.Label>{t("helpers.status.active")}</Chip.Label>
    </Chip>
  );
}

function DiscontinuedStatusChip() {
  const { t } = useTranslation();

  return (
    <Chip variant="secondary">
      <MaterialIcons name="cancel" />
      <Chip.Label>{t("helpers.status.discontinued")}</Chip.Label>
    </Chip>
  );
}

function InactiveStatusChip() {
  const { t } = useTranslation();

  return (
    <Chip variant="secondary">
      <MaterialIcons name="cancel" />
      <Chip.Label>{t("helpers.status.inactive")}</Chip.Label>
    </Chip>
  );
}
