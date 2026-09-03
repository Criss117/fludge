import type { TranslationKey } from "@fludge/i18n/index";
import { SearchField } from "heroui-native/search-field";
import { useTranslation } from "react-i18next";

interface Props {
  query: string;
  setQuery: (query: string) => void;
  placeholder: TranslationKey;
}

export function SearchInput({ query, setQuery, placeholder }: Props) {
  const { t } = useTranslation();

  return (
    <SearchField value={query} onChange={setQuery}>
      <SearchField.Group>
        <SearchField.SearchIcon />
        <SearchField.Input placeholder={t(placeholder)} />
        <SearchField.ClearButton />
      </SearchField.Group>
    </SearchField>
  );
}
