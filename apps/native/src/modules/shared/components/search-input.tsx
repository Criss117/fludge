import type { TranslationKey } from "@fludge/i18n/index";
import { SearchField } from "heroui-native/search-field";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  query: string;
  setQuery: (query: string) => void;
  placeholder: TranslationKey;
  autoFocus?: boolean;
  debounceMs?: number;
}

export function SearchInput({
  query,
  setQuery,
  placeholder,
  autoFocus,
  debounceMs = 300,
}: Props) {
  const { t } = useTranslation();
  const [localQuery, setLocalQuery] = useState(query);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Si el query externo cambia (ej. se limpia desde afuera), sincroniza el input
  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  const handleChange = (value: string) => {
    setLocalQuery(value);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setQuery(value);
    }, debounceMs);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <SearchField value={localQuery} onChange={handleChange}>
      <SearchField.Group>
        <SearchField.SearchIcon />
        <SearchField.Input placeholder={t(placeholder)} autoFocus={autoFocus} />
        <SearchField.ClearButton />
      </SearchField.Group>
    </SearchField>
  );
}

export function SearchInputSkeleton({
  placeholder,
}: {
  placeholder: TranslationKey;
}) {
  const { t } = useTranslation();

  return (
    <SearchField value="" onChange={() => {}}>
      <SearchField.Group>
        <SearchField.SearchIcon />
        <SearchField.Input placeholder={t(placeholder)} isDisabled />
        <SearchField.ClearButton />
      </SearchField.Group>
    </SearchField>
  );
}
