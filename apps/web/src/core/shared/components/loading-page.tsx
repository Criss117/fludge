import { LoaderCircle } from "lucide-react";

export function LoadingPage() {
  return (
    <div className="w-full h-screen flex items-center justify-center flex-col space-y-4">
      <h1 className="text-5xl font-bold text-primary">Fludge</h1>
      <span>
        <LoaderCircle className="size-10 animate-spin" />
      </span>
    </div>
  );
}
