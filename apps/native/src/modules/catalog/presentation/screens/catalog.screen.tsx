import { Tabs } from "heroui-native/tabs";
import { Activity, Suspense, useState } from "react";
import { View } from "react-native";
import { SearchInput } from "@/modules/shared/components/search-input";
import { FadeContentContainer } from "@/modules/shared/components/fade-container";
import { ProductsSection } from "../sections/products.section";
import { CategoriesSection } from "../sections/categories.section";
import { CameraDialog } from "@/modules/shared/components/camera-dialog";
import { getTranslationKey } from "@/modules/shared/utils/translation";
import { useTranslation } from "react-i18next";

const items = [
  {
    id: "products",
    title: getTranslationKey("resources.products.name"),
    searchPlaceholder: getTranslationKey("helpers.placeholder.search_products"),
    CMP: ProductsSection,
  },
  {
    id: "categories",
    title: getTranslationKey("resources.categories.name"),
    searchPlaceholder: getTranslationKey(
      "helpers.placeholder.search_categories"
    ),
    CMP: CategoriesSection,
  },
  {
    id: "movements",
    title: getTranslationKey("resources.movements.name"),
    searchPlaceholder: getTranslationKey(
      "helpers.placeholder.search_movements"
    ),
    CMP: CategoriesSection,
  },
  {
    id: "suppliers",
    title: getTranslationKey("resources.suppliers.name"),
    searchPlaceholder: getTranslationKey(
      "helpers.placeholder.search_suppliers"
    ),
    CMP: CategoriesSection,
  },
] as const;

type Id = (typeof items)[number]["id"];

export function CatalogScreen() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Id>("products");

  return (
    <View className="flex-1 gap-y-4 px-3">
      <View className="flex-row items-center gap-x-2">
        <View className="flex-1">
          <SearchInput
            query={query}
            setQuery={setQuery}
            placeholder={
              items.find((item) => item.id === tab)?.searchPlaceholder!
            }
          />
        </View>
        {tab === "products" && <CameraDialog setBarcode={(b) => setQuery(b)} />}
      </View>
      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as Id)}
        className="flex-1"
      >
        <Tabs.List className="rounded-full">
          <Tabs.ScrollView>
            <Tabs.Indicator className="dark:bg-muted" />
            {items.map((item) => (
              <Tabs.Trigger value={item.id} key={item.id} className="px-4">
                <Tabs.Label>{t(item.title)}</Tabs.Label>
              </Tabs.Trigger>
            ))}
          </Tabs.ScrollView>
        </Tabs.List>
        {items.map((item) => (
          <Activity mode={tab === item.id ? "visible" : "hidden"} key={item.id}>
            <FadeContentContainer>
              <item.CMP query={query.trim()} />
            </FadeContentContainer>
          </Activity>
        ))}
      </Tabs>
    </View>
  );
}

export function CatalogScreenSkeleton() {
  return (
    <View className="flex-1 px-3">
      <Tabs value="members" onValueChange={() => {}} className="flex-1">
        <Tabs.List className="bg-muted rounded-full">
          <Tabs.ScrollView>
            <Tabs.Indicator />
            <Tabs.Trigger value="members" className="w-1/2" isDisabled>
              <Tabs.Label className="text-black dark:text-white">
                Miembros
              </Tabs.Label>
            </Tabs.Trigger>
            <Tabs.Trigger value="groups" className="w-1/2" isDisabled>
              <Tabs.Label className="text-black dark:text-white">
                Grupos
              </Tabs.Label>
            </Tabs.Trigger>
          </Tabs.ScrollView>
        </Tabs.List>
        <Tabs.Content value="members" className="flex-1"></Tabs.Content>
      </Tabs>
    </View>
  );
}
