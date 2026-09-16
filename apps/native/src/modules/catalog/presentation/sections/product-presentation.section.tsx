import { Card } from "heroui-native/card";
import { Chip } from "heroui-native/chip";
import { Typography } from "heroui-native/text";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StatusChip } from "@/modules/shared/components/status-chip";
import { Button } from "heroui-native/button";
import { MaterialIcons } from "@/modules/shared/components/icons";
import { Link } from "expo-router";
import { formatCurrency } from "@fludge/utils/format-currency";
import type { ProductDetail } from "@fludge/client/application/catalog/domain/product.repository";
import { SkeletonGroup } from "heroui-native/skeleton-group";
import { Skeleton } from "heroui-native/skeleton";

interface Props {
  productId: string;
  presentations: ProductDetail["presentations"];
}

export function ProductPresentationSection({
  presentations,
  productId,
}: Props) {
  const { t } = useTranslation();

  return (
    <View className="flex-1 gap-y-2">
      {presentations.map((presentation) => (
        <Card key={presentation.id} className="gap-y-2">
          <Card.Header className="flex-row items-start">
            <View className="flex-1">
              <Card.Title>{presentation.name}</Card.Title>
              <View>
                <Card.Description>{presentation.barcode}</Card.Description>
              </View>
              <Chip>
                <Chip.Label>
                  {t("resources.presentations.conversion_factor")}: x
                  {presentation.conversionFactor}
                </Chip.Label>
              </Chip>
            </View>
            <StatusChip status={presentation.status} />
          </Card.Header>
          <Card.Body>
            <Card className="bg-default">
              <Card.Body>
                <View className="flex-1">
                  <Typography type="body-sm" color="muted">
                    {t("resources.presentations.price_sale")}
                  </Typography>
                  <Typography className="text-success font-semibold">
                    {formatCurrency(presentation.priceSale)}
                  </Typography>
                </View>
                <View className="flex-row">
                  <View className="flex-1">
                    <Typography type="body-sm" color="muted">
                      {t("resources.presentations.price_purchase")}
                    </Typography>
                    <Typography>
                      {formatCurrency(presentation.pricePurchase ?? 0)}
                    </Typography>
                  </View>
                  <View className="flex-1">
                    <Typography type="body-sm" color="muted">
                      {t("resources.presentations.price_wholesale")}
                    </Typography>
                    <Typography>
                      {formatCurrency(presentation.priceWholesale ?? 0)}
                    </Typography>
                  </View>
                </View>
              </Card.Body>
            </Card>
          </Card.Body>
        </Card>
      ))}
      {presentations.length === 0 && (
        <View className="flex-1 items-center justify-center">
          <Typography>{t("helpers.no_presentations")}</Typography>
        </View>
      )}
      <Link
        href={{
          pathname: "/dashboard/products/[productid]/update",
          params: { productid: productId, openPresentationForm: "true" },
        }}
        asChild
        push
      >
        <Button variant="outline" className="border-muted border-dashed">
          <MaterialIcons name="add" size={20} className="text-muted" />
          <Button.Label className="text-muted">
            {t("forms.product.sections.presentations.add")}
          </Button.Label>
        </Button>
      </Link>
    </View>
  );
}

export function ProductPresentationSectionSkeleton() {
  const { t } = useTranslation();

  return (
    <View className="flex-1 gap-y-2">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className="gap-y-2">
          <Card.Header className="flex-row items-start">
            <SkeletonGroup className="flex-1 gap-y-1">
              <SkeletonGroup.Item className="h-7 w-4/5 rounded-full" />
              <SkeletonGroup.Item className="h-6 w-3/5 rounded-full" />
              <SkeletonGroup.Item className="h-6 w-3/5 rounded-full" />
            </SkeletonGroup>
            <Skeleton className="h-6 w-1/5 rounded-full" />
          </Card.Header>
          <Skeleton className="h-36 w-full rounded-3xl" />
        </Card>
      ))}

      <Button
        variant="outline"
        className="border-muted border-dashed"
        isDisabled
      >
        <MaterialIcons name="add" size={20} className="text-muted" />
        <Button.Label className="text-muted">
          {t("forms.product.sections.presentations.add")}
        </Button.Label>
      </Button>
    </View>
  );
}
