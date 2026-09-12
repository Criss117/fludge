import type { ProductSummary } from "@fludge/client/application/catalog/queries/use-find-products";
import { formatCurrency } from "@fludge/utils/format-currency";
import { Card } from "heroui-native/card";
import { Checkbox } from "heroui-native/checkbox";
import { PressableFeedback } from "heroui-native/pressable-feedback";
import { Typography } from "heroui-native/text";
import { useTicketItemSelector } from "@fludge/client/presentation/sales/sale-ticket-item-selector.provider";

interface Props {
  presentation: ProductSummary["presentations"][number];
  context: ReturnType<typeof useTicketItemSelector>;
}

export function SalePresentationCard({ presentation, context }: Props) {
  const isSelected = context.isPresentationSelected(presentation);

  return (
    <PressableFeedback
      onPress={() => context.selectPresentation(presentation)}
      className="rounded-3xl shadow"
    >
      <Card className="flex-row items-center gap-x-1">
        <Card.Header>
          <Checkbox
            isSelected={isSelected}
            onPress={() => context.selectPresentation(presentation)}
          />
        </Card.Header>
        <Card.Body className="flex-1 gap-y-1">
          <Typography className="line-clamp-1">{presentation.name}</Typography>
          <Typography className="text-muted text-sm">
            {presentation.barcode}
          </Typography>
        </Card.Body>
        <Card.Footer className="flex-col items-end">
          <Typography className="font-semibold">
            {formatCurrency(presentation.priceSale)}
          </Typography>
          <Typography className="text-muted text-sm">
            x {presentation.conversionFactor}
          </Typography>
        </Card.Footer>
      </Card>
    </PressableFeedback>
  );
}
