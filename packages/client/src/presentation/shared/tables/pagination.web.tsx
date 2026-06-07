import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Button } from "@fludge/ui/components/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@fludge/ui/components/select";

interface PageSizeProps {
  pageSize: number;
  setPageSize: (size: number) => void;
}

interface FirstPageProps {
  canPreviousPage: boolean;
  firstPage: () => void;
}

interface PrevPageProps {
  canPreviousPage: boolean;
  previusPage: () => void;
}

interface NextPageProps {
  canNextPage: boolean;
  nextPage: () => void;
}

interface LastPageProps {
  canNextPage: boolean;
  lastPage: () => void;
}

export function PageSize({ pageSize, setPageSize }: PageSizeProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Filas por página</span>
      <Select
        value={pageSize}
        defaultValue={pageSize}
        onValueChange={(v) => {
          if (!v) return;
          setPageSize(v);
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="10" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {[10, 20, 30, 40, 50].map((size) => (
              <SelectItem key={size} value={size}>
                {size}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

export function FirstPage({ firstPage, canPreviousPage }: FirstPageProps) {
  return (
    <Button
      variant="outline"
      size="icon-xs"
      onClick={firstPage}
      disabled={!canPreviousPage}
      aria-label="Primera página"
    >
      <ChevronsLeft />
    </Button>
  );
}

export function PrevPage({ previusPage, canPreviousPage }: PrevPageProps) {
  return (
    <Button
      variant="outline"
      size="icon-xs"
      onClick={previusPage}
      disabled={!canPreviousPage}
      aria-label="Página anterior"
    >
      <ChevronLeft />
    </Button>
  );
}

export function NextPage({ nextPage, canNextPage }: NextPageProps) {
  return (
    <Button
      variant="outline"
      size="icon-xs"
      onClick={nextPage}
      disabled={!canNextPage}
      aria-label="Página siguiente"
    >
      <ChevronRight />
    </Button>
  );
}

export function LastPage({ lastPage, canNextPage }: LastPageProps) {
  return (
    <Button
      variant="outline"
      size="icon-xs"
      onClick={lastPage}
      disabled={!canNextPage}
      aria-label="Última página"
    >
      <ChevronsRight />
    </Button>
  );
}
