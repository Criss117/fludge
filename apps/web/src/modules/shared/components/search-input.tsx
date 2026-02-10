import { Search, X } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder,
  id = "search-input",
}: Props) {
  return (
    <div className="relative">
      <Search className="absolute left-2 top-1/2 -translate-y-1/2" size={18} />
      <Input
        id={id}
        className="pl-8"
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <Button
        onClick={() => onChange("")}
        size="icon-sm"
        variant="ghost"
        className="absolute right-0 top-1/2 -translate-y-1/2"
      >
        <X />
      </Button>
    </div>
  );
}
