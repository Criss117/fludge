import { getI18nKey } from "@fludge/api/core/shared/i18n/utils";
import { type DefaultError, useMutation, type UseMutationOptions } from "@tanstack/react-query";

import { type NetworkStatus, useNetwork } from "../providers/network-status.provider";

export class NetworkUnavailableError extends Error {
  constructor(readonly status: Exclude<NetworkStatus, "online">) {
    super(status);
    this.name = "NetworkUnavailableError";
    switch (status) {
      case "offline":
        this.message = getI18nKey("helpers.network_status.offline");
        break;
      case "checking":
        this.message = getI18nKey("helpers.network_status.checking");
        break;
      case "server-down":
        this.message = getI18nKey("helpers.network_status.server_down");
        break;
      default:
        this.message = getI18nKey("helpers.network_status.online");
        break;
    }
  }
}

export function useNetworkMutation<
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TOnMutateResult = unknown,
>(options: UseMutationOptions<TData, TError, TVariables, TOnMutateResult>) {
  const { status } = useNetwork();

  return useMutation({
    ...options,
    networkMode: "always", // evita que TanStack pause la mutation por su cuenta
    mutationFn: (variables, context) => {
      if (status !== "online") throw new NetworkUnavailableError(status);

      return options.mutationFn!(variables, context);
    },
  });
}
