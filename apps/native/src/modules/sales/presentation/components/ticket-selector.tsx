import { useTickets } from "@fludge/client/providers/tickets.provider";
import { Button } from "heroui-native/button";
import { Select } from "heroui-native/select";
import { Typography } from "heroui-native/text";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { MaterialIcons } from "@/modules/shared/components/icons";
import type { Ticket } from "@fludge/client/application/sales/store/tickets.store/data";

type TicketOption = { label: string; value: string };

export function getTicketOptions(
  tickets: Record<string, Ticket>
): TicketOption[] {
  return Object.keys(tickets).map((ticketId) => ({
    label: ticketId,
    value: ticketId,
  }));
}

export function TicketSelector() {
  const { t } = useTranslation();
  const { state, dispatch, activeTicket } = useTickets();
  const options = getTicketOptions(state.tickets);

  const selectedOption = options.find(
    (option) => option.value === activeTicket.id
  );

  return (
    <View className="flex-row items-center gap-2 px-3">
      <Select
        className=""
        isDisabled={options.length === 0}
        value={selectedOption}
        onValueChange={(option) => {
          if (!option?.value) return;

          dispatch({
            type: "setActiveTicket",
            payload: [option.value],
          });
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
        onPress={() => dispatch({ type: "createTicket" })}
      >
        <MaterialIcons name="add" size={22} className="text-foreground" />
      </Button>
      <Button
        accessibilityLabel={t("screens.sales.ticket.delete")}
        isDisabled={!activeTicket}
        isIconOnly
        size="sm"
        variant="ghost"
        onPress={() =>
          dispatch({
            type: "deleteTicket",
            payload: [activeTicket.id],
          })
        }
      >
        <MaterialIcons name="delete" size={22} className="text-danger" />
      </Button>
    </View>
  );
}
