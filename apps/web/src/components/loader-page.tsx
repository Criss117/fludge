import { Loader2 } from "lucide-react";

export function LoaderPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center flex-col gap-y-2">
      <h1 className="text-7xl font-semibold">Fludge</h1>
      <Loader2 className="animate-spin size-14" />
    </div>
  );
}
