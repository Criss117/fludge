import { Button } from "heroui-native/button";
import { Select } from "heroui-native/select";
import { Typography } from "heroui-native/text";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { MaterialIcons } from "@/modules/shared/components/icons";
import { useTicketStore } from "@fludge/client/application/sales/store/use-ticket.store";
import { Ticket } from "@fludge/client/application/sales/domain/repositories/local-ticket.repository";

type TicketOption = { label: string; value: string };

export function getTicketOptions(tickets: Ticket[]): TicketOption[] {
  return tickets.map(({ id, name }) => ({
    label: name,
    value: id,
  }));
}

export function TicketSelector() {
  const { t } = useTranslation();
  const {
    store,
    activeTicket,
    switchActiveTicket,
    createTicket,
    removeTicket,
  } = useTicketStore();
  const options = getTicketOptions(store);

  const selectedOption = options.find(
    (option) => option.value === activeTicket.id
  );

  const handleSwitchTicket = (ticketId: string) => {
    switchActiveTicket.mutate(ticketId);
  };

  const handleCreateTicket = () => {
    createTicket.mutate();
  };

  const handleRemoveTicket = () => {
    removeTicket.mutate(activeTicket.id);
  };

  return (
    <View className="flex-row items-center gap-2 px-3">
      <Select
        className=""
        isDisabled={options.length === 0}
        value={selectedOption}
        onValueChange={(option) => {
          if (!option?.value) return;

          handleSwitchTicket(option.value);
        }}
        presentation="popover"
      >
        <Select.Trigger className="bg-default">
          <Typography maxFontSizeMultiplier={1}>
            {selectedOption?.label ?? t("screens.sales.ticket.empty")}
          </Typography>
          <Select.TriggerIndicator />
        </Select.Trigger>
        <Select.Portal>
          <Select.Overlay className="bg-black/50" />
          <Select.Content presentation="popover">
            <Select.ListLabel>
              {t("screens.sales.ticket.select_label")}
            </Select.ListLabel>
            {options.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                label={option.label}
              >
                <Typography className="flex-1" maxFontSizeMultiplier={1}>
                  {option.label}
                </Typography>
                <Select.ItemIndicator />
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Portal>
      </Select>

      <Button
        accessibilityLabel={t("screens.sales.ticket.create")}
        isIconOnly
        size="sm"
        variant="ghost"
        onPress={handleCreateTicket}
      >
        <MaterialIcons name="add" size={22} className="text-foreground" />
      </Button>
      <Button
        accessibilityLabel={t("screens.sales.ticket.delete")}
        isDisabled={!activeTicket}
        isIconOnly
        size="sm"
        variant="ghost"
        onPress={handleRemoveTicket}
      >
        <MaterialIcons name="delete" size={22} className="text-danger" />
      </Button>
    </View>
  );
}
