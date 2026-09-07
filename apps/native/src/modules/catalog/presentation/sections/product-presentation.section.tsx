import { SearchInput } from "@/modules/shared/components/search-input";
import type { ProductDetail } from "@fludge/client/application/catalog/queries/use-find-products";
import { Card } from "heroui-native/card";
import { Chip } from "heroui-native/chip";
import { Separator } from "heroui-native/separator";
import { Typography } from "heroui-native/text";
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { formatCurrency } from "../../../../../../../packages/utils/src/format-currency";
import { StatusChip } from "@/modules/shared/components/status-chip";

interface Props {
  presentations: ProductDetail["presentations"];
}

export function ProductPresentationSection({ presentations }: Props) {
  const [search, setSearch] = useState("");
  const { t } = useTranslation();

  const filteredPresentations = useMemo(
    () =>
      presentations.filter((presentation) =>
        presentation.searchBlob.toLowerCase().includes(search.toLowerCase())
      ),
    [presentations, search]
  );

  return (
    <View className="flex-1 gap-y-2">
      <SearchInput
        query={search}
        setQuery={setSearch}
        placeholder="helpers.placeholder.search_presentations"
      />
      {filteredPresentations.map((presentation) => (
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
      {filteredPresentations.length === 0 && (
        <View className="flex-1 items-center justify-center">
          <Typography>{t("helpers.no_presentations")}</Typography>
        </View>
      )}
    </View>
  );
}
