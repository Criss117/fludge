import { CommonInputs } from "@/modules/shared/components/common-input";
import { MaterialIcons } from "@/modules/shared/components/icons";
import { formatPrice } from "@fludge/utils/currency";
import { cn } from "heroui-native";
import { Card } from "heroui-native/card";
import { Typography } from "heroui-native/text";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

interface Props {
  total: number;
}

export function AmountReceivedSection({ total }: Props) {
  const [amount, setAmount] = useState(total);
  const { t } = useTranslation();

  const rest = amount - total;

  return (
    <Card className="gap-y-2">
      <Card.Header className="flex-row items-center gap-x-1">
        <MaterialIcons
          name="point-of-sale"
          size={20}
          className="text-foreground"
        />
        <Card.Title>
          {t("screens.charge.sections.amount_received.title")}
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <CommonInputs.NumberInput
          isRequired
          isInvalid={false}
          icon="attach-money"
          inputProps={{
            className: "text-right bg-default text-xl px-4",
            placeholder: "helpers.placeholder.zero",
            onChangeText: setAmount,
            value: amount,
          }}
        />
      </Card.Body>
      <Card.Footer>
        <Card
          className={cn(
            "flex-row border",
            rest >= 0
              ? "border-success bg-success/20"
              : "border-danger bg-danger/20"
          )}
        >
          <Card.Header className="flex-1 flex-row items-center gap-x-1">
            <MaterialIcons
              name="assignment-return"
              size={20}
              className={cn(rest >= 0 ? "text-success" : "text-danger")}
            />
            <View>
              <Card.Title
                className={cn(
                  "text-base",
                  rest >= 0 ? "text-success" : "text-danger"
                )}
              >
                {t("screens.charge.sections.amount_received.resubmitted.title")}
              </Card.Title>
              <Card.Description className="text-muted text-sm">
                {t(
                  "screens.charge.sections.amount_received.resubmitted.description"
                )}
              </Card.Description>
            </View>
          </Card.Header>
          <Card.Body>
            <Typography type="h6">{formatPrice(rest)}</Typography>
          </Card.Body>
        </Card>
      </Card.Footer>
    </Card>
  );
}
