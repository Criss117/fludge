import { Chip } from "heroui-native/chip";
import { MaterialIcons } from "./icons";

export function StatusChip({ status }: { status: "active" | "inactive" }) {
  if (status === "active") {
    return (
      <Chip className="bg-green-500">
        <MaterialIcons
          name="check-circle"
          className="text-white dark:text-black"
        />
        <Chip.Label>Activo</Chip.Label>
      </Chip>
    );
  }

  return (
    <Chip variant="secondary">
      <MaterialIcons name="cancel" />
      <Chip.Label>Inactivo</Chip.Label>
    </Chip>
  );
}
