import { MaterialIcons } from "@/modules/shared/components/icons";
import { useMutationToast } from "@/modules/shared/hooks/use-mutation-toast";
import {
  useSyncCatalog,
  type SyncData,
} from "@fludge/client/application/sync/use-sync-catalog";
import { useSyncIam } from "@fludge/client/application/sync/use-sync-iam";
import { useSyncCustomer } from "@fludge/client/application/sync/use-sync-customer";
import { useNetwork } from "@fludge/client/providers/network-status.provider";
import { TranslationKey } from "@fludge/i18n/index";
import type { UseSuspenseQueryResult } from "@tanstack/react-query";
import { Button } from "heroui-native/button";
import { Card } from "heroui-native/card";
import { Typography } from "heroui-native/text";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

interface Props {
  syncHook: UseSuspenseQueryResult<SyncData, Error>;
  module: "iam" | "catalog" | "customer";
  icon: "security" | "view-list" | "people";
}

function SyncItem({ module, syncHook, icon }: Props) {
  const { t } = useTranslation();

  const { isInternetReachable } = useNetwork();

  const mutationToast = useMutationToast(`sync-toast-${module}`);

  const isDisabled = syncHook.isRefetching || !isInternetReachable;

  const translationBaseKey = `screens.settings.sync.${module}` as const;

  function sync() {
    if (!isInternetReachable) {
      mutationToast.showErrorToast(
        `${translationBaseKey}.on_error.title` as TranslationKey,
        "helpers.no_conection"
      );
      return;
    }

    if (syncHook.isRefetching) return;

    mutationToast.showIsPendingToast(
      `${translationBaseKey}.refetching` as TranslationKey
    );
    syncHook
      .refetch()
      .then(() => {
        mutationToast.showSuccessToast(
          `${translationBaseKey}.on_success.title` as TranslationKey,
          `${translationBaseKey}.on_success.description` as TranslationKey
        );
      })
      .catch(() => {
        mutationToast.showErrorToast(
          `${translationBaseKey}.on_error.title` as TranslationKey,
          `${translationBaseKey}.on_error.description` as TranslationKey
        );
      });
  }

  return (
    <View className="flex-row justify-between">
      <View>
        <View className="flex-row items-center gap-x-2">
          <MaterialIcons name={icon} size={20} className="text-foreground" />
          <Typography>
            {t(`${translationBaseKey}.title` as TranslationKey)}
          </Typography>
        </View>
        {syncHook.data.syncedAt !== null && (
          <Typography type="body-sm" color="muted">
            {t(`${translationBaseKey}.last_synced_at` as TranslationKey)}:{" "}
            {syncHook.data.syncedAt.toLocaleDateString()}
          </Typography>
        )}
      </View>
      <Button isIconOnly isDisabled={isDisabled} onPress={sync}>
        <MaterialIcons name="sync" size={20} className="text-eclipse" />
      </Button>
    </View>
  );
}

export function SettingsSyncSection() {
  const { t } = useTranslation();
  const iamSync = useSyncIam();
  const catalogSync = useSyncCatalog();
  const customerSync = useSyncCustomer();

  return (
    <Card>
      <Card.Header>
        <Card.Title>{t("screens.settings.sync.title")}</Card.Title>
      </Card.Header>
      <Card.Body className="gap-y-2">
        <SyncItem module="iam" syncHook={iamSync} icon="security" />
        <SyncItem module="catalog" syncHook={catalogSync} icon="view-list" />
        <SyncItem module="customer" syncHook={customerSync} icon="people" />
      </Card.Body>
    </Card>
  );
}
