import { getI18nKey } from "@fludge/api/core/shared/i18n/utils";
import { useFindAllMembers } from "@fludge/client/iam/queries/use-find-members";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import type { MembersListProps } from "./types";

export function useMembersScreen() {
  const [searchQuery, setSearchQuery] = useState("");

  return {
    state: {
      searchQuery,
    },
    actions: {
      setSearchQuery,
    },
    texts: {
      search: {
        label: getI18nKey("screens.iam.members.search.label"),
        placeholder: getI18nKey("screens.iam.members.search.placeholder"),
      },
    },
  };
}

export function useMembersListSection(props: MembersListProps) {
  const { t } = useTranslation();
  const { data } = useFindAllMembers({
    searchQuery: props.searchQuery,
  });

  return {
    texts: {
      empty: t("screens.iam.members.empty"),
    },
    state: {
      items: data,
    },
  };
}
