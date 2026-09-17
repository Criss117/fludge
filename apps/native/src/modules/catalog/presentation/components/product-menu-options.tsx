import { MaterialIcons } from "@/modules/shared/components/icons";
import type { ProductDetail } from "@fludge/client/application/catalog/domain/product.repository";
import { Link } from "expo-router";
import { cn } from "heroui-native";
import { Popover, type PopoverTriggerRef } from "heroui-native/popover";
import { PressableFeedback } from "heroui-native/pressable-feedback";
import { Typography } from "heroui-native/text";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, View } from "react-native";

interface Props {
  product: ProductDetail;
}

const ProductStatus = {
  active: {
    icon: "delete",
    label: "helpers.deactivate",
    textColor: "text-danger",
  },
  inactive: {
    icon: "bookmarks",
    label: "helpers.activate",
    textColor: "text-success",
  },
  discontinued: {
    icon: "delete",
    label: "helpers.activate",
    textColor: "text-danger",
  },
} as const;

const width = Dimensions.get("window").width;

export function ProductMenuOptions({ product }: Props) {
  const { t } = useTranslation();
  const popoverRef = useRef<PopoverTriggerRef>(null);

  return (
    <Popover presentation="popover">
      <Popover.Trigger asChild ref={popoverRef}>
        <PressableFeedback className="pl-4">
          <MaterialIcons
            name="more-vert"
            size={24}
            className="text-foreground"
          />
        </PressableFeedback>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Overlay className="bg-default-soft" />
        <Popover.Content
          presentation="popover"
          width={Math.floor(width / 2)}
          className="gap-y-4"
        >
          <Link
            href={{
              pathname: "/dashboard/products/[productid]/update",
              params: { productid: product.id },
            }}
            push
            asChild
          >
            <PressableFeedback onPress={() => popoverRef.current?.close()}>
              <View className="flex-row items-center gap-x-2">
                <View className="w-1/4 items-center">
                  <MaterialIcons
                    name="edit"
                    size={20}
                    className="text-foreground"
                  />
                </View>

                <Typography>{t("helpers.edit")}</Typography>
              </View>
            </PressableFeedback>
          </Link>

          <PressableFeedback onPress={() => popoverRef.current?.close()}>
            <View className="flex-row items-center gap-x-2">
              <View className="w-1/4 items-center">
                <MaterialIcons
                  name={ProductStatus[product.status].icon}
                  size={20}
                  className={cn(ProductStatus[product.status].textColor)}
                />
              </View>

              <Typography
                className={cn(ProductStatus[product.status].textColor)}
              >
                {t(ProductStatus[product.status].label)}
              </Typography>
            </View>
          </PressableFeedback>
        </Popover.Content>
      </Popover.Portal>
    </Popover>
  );
}
