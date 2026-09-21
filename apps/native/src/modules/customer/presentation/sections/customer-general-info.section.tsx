import { MaterialIcons } from "@/modules/shared/components/icons";
import type { CustomerDetail } from "@fludge/client/application/customer/domain/customer.repository";
import { Button } from "heroui-native/button";
import { Card } from "heroui-native/card";
import { Typography } from "heroui-native/text";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

function copyToClipboard(text: string) {
  // Fake clipboard copy - no library installed yet
  console.log("Copied to clipboard:", text);
}

export function CustomerInfoSection({
  customer,
}: {
  customer: CustomerDetail;
}) {
  const { t } = useTranslation();

  const identification = customer.documentNumber
    ? `${customer.documentType ?? ""} ${customer.documentNumber}`.trim()
    : "-";

  return (
    <Card className="gap-y-4">
      <Card.Header className="flex-row items-center gap-x-3">
        <View className="bg-accent/40 size-14 items-center justify-center rounded-full">
          <MaterialIcons name="person" size={28} className="text-foreground" />
        </View>
        <View className="flex-1">
          <Card.Title>{customer.name}</Card.Title>
          <View className="flex-row items-center gap-x-1">
            <MaterialIcons name="badge" size={14} className="text-muted" />
            <Card.Description>{identification}</Card.Description>
          </View>
        </View>
      </Card.Header>

      <Card.Body className="gap-y-3">
        <View className="flex-row items-center gap-x-2">
          <MaterialIcons
            name="calendar-today"
            size={16}
            className="text-muted"
          />
          <Typography type="body-sm" color="muted">
            {t("helpers.created_at")}
          </Typography>
          <Typography type="body-sm">
            {customer.createdAt.toLocaleDateString()}
          </Typography>
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-1 flex-row items-center gap-x-2">
            <MaterialIcons name="email" size={16} className="text-muted" />
            <Typography type="body-sm" color="muted" className="flex-1">
              {customer.email ?? "-"}
            </Typography>
          </View>
          {customer.email && (
            <Button
              isIconOnly
              size="sm"
              variant="ghost"
              onPress={() => copyToClipboard(customer.email!)}
            >
              <MaterialIcons
                name="content-copy"
                size={16}
                className="text-muted"
              />
            </Button>
          )}
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-1 flex-row items-center gap-x-2">
            <MaterialIcons name="phone" size={16} className="text-muted" />
            <Typography type="body-sm" color="muted" className="flex-1">
              {customer.phone ?? "-"}
            </Typography>
          </View>
          {customer.phone && (
            <Button
              isIconOnly
              size="sm"
              variant="ghost"
              onPress={() => copyToClipboard(customer.phone!)}
            >
              <MaterialIcons
                name="content-copy"
                size={16}
                className="text-muted"
              />
            </Button>
          )}
        </View>
      </Card.Body>
    </Card>
  );
}
