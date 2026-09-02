import { SearchField } from "heroui-native/search-field";

interface Props {
  query: string;
  setQuery: (query: string) => void;
  placeholder: string;
}

export function SearchInput({ query, setQuery, placeholder }: Props) {
  return (
    <SearchField value={query} onChange={setQuery}>
      <SearchField.Group>
        <SearchField.SearchIcon />
        <SearchField.Input placeholder={placeholder} />
        <SearchField.ClearButton />
      </SearchField.Group>
    </SearchField>
  );
}
