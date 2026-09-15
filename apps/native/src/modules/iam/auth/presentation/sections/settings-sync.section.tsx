import { MaterialIcons } from "@/modules/shared/components/icons";
import { useMutationToast } from "@/modules/shared/hooks/use-mutation-toast";
import { useSyncIam } from "@fludge/client/application/sync/use-sync-iam";
import { useNetwork } from "@fludge/client/providers/network-status.provider";
import { Button } from "heroui-native/button";
import { Card } from "heroui-native/card";
import { Typography } from "heroui-native/text";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

export function SettingsSyncSection() {
  const { t } = useTranslation();
  const { isInternetReachable } = useNetwork();
  const iamSync = useSyncIam();
  const mutationToast = useMutationToast("sync-toast");

  const isDisabled = iamSync.isRefetching || !isInternetReachable;

  function syncIam() {
    if (!isInternetReachable) {
      mutationToast.showErrorToast(
        "screens.settings.sync.iam.on_error.title",
        "helpers.no_conection"
      );
      return;
    }

    if (iamSync.isRefetching) return;

    mutationToast.showIsPendingToast("screens.settings.sync.iam.refetching");
    iamSync
      .refetch()
      .then(() => {
        mutationToast.showSuccessToast(
          "screens.settings.sync.iam.on_success.title",
          "screens.settings.sync.iam.on_success.description"
        );
      })
      .catch(() => {
        mutationToast.showErrorToast(
          "screens.settings.sync.iam.on_error.title",
          "screens.settings.sync.iam.on_error.description"
        );
      });
  }

  return (
    <Card>
      <Card.Header>
        <Card.Title>{t("screens.settings.sync.title")}</Card.Title>
      </Card.Header>
      <Card.Body>
        <View className="flex-row justify-between">
          <View>
            <View className="flex-row items-center gap-x-2">
              <MaterialIcons
                name="security"
                size={20}
                className="text-foreground"
              />
              <Typography>{t("screens.settings.sync.iam.title")}</Typography>
            </View>
            {iamSync.data.syncedAt !== null && (
              <Typography type="body-sm" color="muted">
                {t("screens.settings.sync.iam.last_synced_at")}:{" "}
                {iamSync.data.syncedAt.toLocaleDateString()}
              </Typography>
            )}
          </View>
          <Button isIconOnly isDisabled={isDisabled} onPress={syncIam}>
            <MaterialIcons name="sync" size={20} className="text-eclipse" />
          </Button>
        </View>
      </Card.Body>
    </Card>
  );
}
