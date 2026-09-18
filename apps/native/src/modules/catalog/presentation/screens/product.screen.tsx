import { MaterialIcons } from "@/modules/shared/components/icons";
import { Separator } from "heroui-native";
import { Card } from "heroui-native/card";
import { Chip } from "heroui-native/chip";
import { Typography } from "heroui-native/text";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { IsCriticalStock } from "../components/is-critical-stock";
import {
  ProductPresentationSection,
  ProductPresentationSectionSkeleton,
} from "../sections/product-presentation.section";
import type { ProductDetail } from "@fludge/client/application/catalog/domain/product.repository";
import { Skeleton } from "heroui-native/skeleton";
import { Tabs } from "heroui-native/tabs";
import { useState } from "react";

interface Props {
  product: ProductDetail;
}

export function ProductScreen({ product }: Props) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("presentations");

  return (
    <ScrollView
      className="px-3"
      contentContainerClassName="gap-y-4 pb-20"
      showsVerticalScrollIndicator={false}
    >
      <Card className="gap-y-2">
        <Card.Header>
          <Card.Title className="line-clamp-2 flex-1">
            {product.name}
          </Card.Title>
          <Card.Description className="line-clamp-2">
            {product.description}
          </Card.Description>
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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List className="flex-1">
          <Tabs.Indicator />
          <Tabs.Trigger value="presentations" className="h-full flex-1">
            <Tabs.Label className="text-sm">
              {t("screens.products.product.sections.presentations.title")}
            </Tabs.Label>
          </Tabs.Trigger>
          <Tabs.Trigger value="movements" className="h-full flex-1">
            <Tabs.Label className="text-sm">
              {t("screens.products.product.sections.movements.title")}
            </Tabs.Label>
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="presentations">
          <ProductPresentationSection
            presentations={product.presentations}
            productId={product.id}
          />
        </Tabs.Content>
      </Tabs>
    </ScrollView>
  );
}

export function ProductScreenSkeleton() {
  const { t } = useTranslation();

  return (
    <ScrollView
      className="px-3"
      contentContainerClassName="gap-y-4 pb-20"
      showsVerticalScrollIndicator={false}
    >
      <Card className="gap-y-2">
        <Card.Header className="flex-row items-start">
          <View className="flex-1 gap-y-1">
            <Skeleton className="h-7 w-3/5 rounded-full" />
            <Skeleton className="h-7 w-4/5 rounded-full" />
          </View>
        </Card.Header>
        <Card.Body>
          <Card className="bg-default gap-y-3">
            <Card.Header className="flex-row items-start justify-between">
              <View className="flex-1">
                <Card.Description>
                  {t("screens.products.product.sections.details.stock")}
                </Card.Description>
                <View className="flex-row items-end gap-x-1">
                  <Skeleton className="h-5 w-1/5 rounded-full" />
                  <Typography type="body-sm" color="muted">
                    {t("helpers.units")}
                  </Typography>
                </View>
              </View>
              <Skeleton />
            </Card.Header>
            <Separator className="bg-accent" />
            <Card.Body className="gap-y-2">
              <Skeleton className="h-5 w-3/5 rounded-full" />
              <Skeleton className="h-5 w-3/5 rounded-full" />
            </Card.Body>
          </Card>
        </Card.Body>
      </Card>

      <Tabs value="presentations" onValueChange={() => {}}>
        <Tabs.List className="flex-1">
          <Tabs.Indicator />
          <Tabs.Trigger
            value="presentations"
            className="h-full flex-1"
            isDisabled
          >
            <Tabs.Label className="text-sm">
              {t("screens.products.product.sections.presentations.title")}
            </Tabs.Label>
          </Tabs.Trigger>
          <Tabs.Trigger value="movements" className="h-full flex-1" isDisabled>
            <Tabs.Label className="text-sm">
              {t("screens.products.product.sections.movements.title")}
            </Tabs.Label>
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="presentations">
          <ProductPresentationSectionSkeleton />
        </Tabs.Content>
      </Tabs>
    </ScrollView>
  );
}
