import { ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { useRouter } from "@tanstack/react-router";

export function BackButton() {
  const router = useRouter();

  return (
    <Button variant="link" onClick={() => router.history.back()} size="icon">
      <ArrowLeft className="size-6" />
    </Button>
  );
}
