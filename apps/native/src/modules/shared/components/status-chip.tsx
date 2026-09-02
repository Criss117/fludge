import { Chip } from "heroui-native/chip";
import { MaterialIcons } from "./icons";

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
  return (
    <Chip className="bg-green-500">
      <MaterialIcons name="check-circle" className="text-eclipse" />
      <Chip.Label>Activo</Chip.Label>
    </Chip>
  );
}

function DiscontinuedStatusChip() {
  return (
    <Chip variant="secondary">
      <MaterialIcons name="cancel" />
      <Chip.Label>Inactivo</Chip.Label>
    </Chip>
  );
}

function InactiveStatusChip() {
  return (
    <Chip variant="secondary">
      <MaterialIcons name="cancel" />
      <Chip.Label>Inactivo</Chip.Label>
    </Chip>
  );
}
