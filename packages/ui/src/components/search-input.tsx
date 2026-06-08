import { Button } from "@fludge/ui/components/button";
import { Input } from "@fludge/ui/components/input";
import { SearchIcon, XIcon } from "lucide-react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}

export function SearchInput({ value, onChange, placeholder }: Props) {
  return (
    <div className="relative">
      <Button className="absolute left-0" size="icon" disabled variant="ghost">
        <SearchIcon className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-0"
        onClick={() => onChange("")}
      >
        <XIcon />
      </Button>
      <Input
        value={value}
        className="w-full pl-8"
        placeholder={placeholder}
        onChange={(v) => onChange(v.target.value)}
      />
    </div>
  );
}
