import { getI18nKey } from "@fludge/api/core/shared/i18n/utils";
import { useState } from "react";

export function useGroupsScreen() {
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
        label: getI18nKey("screens.iam.groups.search.label"),
        placeholder: getI18nKey("screens.iam.groups.search.placeholder"),
      },
    },
  };
}
