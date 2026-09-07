import { MaterialIcons } from "@/modules/shared/components/icons";
import { ProductDetail } from "@fludge/client/application/catalog/queries/use-find-products";
import { Separator } from "heroui-native";
import { Card } from "heroui-native/card";
import { Chip } from "heroui-native/chip";
import { Typography } from "heroui-native/text";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { IsCriticalStock } from "../components/is-cristical-stock";
import { ProductPresentationSection } from "../sections/product-presentation.section";
import { Link } from "expo-router";
import { Button } from "heroui-native/button";

interface Props {
  product: ProductDetail;
}

export function ProductScreen({ product }: Props) {
  const { t } = useTranslation();

  return (
    <ScrollView className="px-3" contentContainerClassName="gap-y-4 pb-20">
      <Card>
        <Card.Header className="flex-row items-start">
          <View className="flex-1">
            <Card.Title>{product.name}</Card.Title>
            <Card.Description>{product.description}</Card.Description>
          </View>
          <Link
            href={{
              pathname: "/dashboard/products/[productid]/update",
              params: { productid: product.id },
            }}
            asChild
            push
          >
            <Button size="sm" variant="ghost" isIconOnly>
              <MaterialIcons
                name="edit"
                size={20}
                className="text-foreground"
              />
            </Button>
          </Link>
        </Card.Header>
        <Card.Body>
          <Card className="bg-default gap-y-3">
            <Card.Header className="flex-row items-start justify-between">
              <View className="flex-1">
                <Card.Description>
                  {t("screens.products.product.sections.details.stock")}
                </Card.Description>
                <View className="flex-row items-end gap-x-1">
                  <Card.Title className="text-xl">{product.stock}</Card.Title>
                  <Typography type="body-sm" color="muted">
                    {t("helpers.units")}
                  </Typography>
                </View>
              </View>
              <IsCriticalStock
                stock={product.stock}
                minStock={product.minStock}
                allowNegativeStock={product.allowNegativeStock}
              />
            </Card.Header>
            <Separator className="bg-accent" />
            <Card.Body className="gap-y-2">
              <Chip size="sm">
                <MaterialIcons
                  name="conveyor-belt"
                  size={14}
                  className="text-muted"
                />
                <Chip.Label>
                  {t("screens.products.product.sections.details.min_stock")}:{" "}
                  {product.minStock}
                </Chip.Label>
              </Chip>
              <Chip size="sm">
                <MaterialIcons name="block" size={14} className="text-muted" />
                <Chip.Label>
                  {t(
                    "screens.products.product.sections.details.negative_stock"
                  )}
                  :{" "}
                  {product.allowNegativeStock
                    ? t("helpers.allowed")
                    : t("helpers.not_allowed")}
                </Chip.Label>
              </Chip>
            </Card.Body>
          </Card>
        </Card.Body>
      </Card>

      <ProductPresentationSection
        presentations={product.presentations}
        productId={product.id}
      />
    </ScrollView>
  );
}
