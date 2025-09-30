import { AlertCircleIcon } from "lucide-react";
import { Alert, AlertTitle } from "./ui/alert";

interface Props {
  title?: string;
}

export function UserHasNoPermissionAlert({ title }: Props) {
  return (
    <Alert variant="destructive">
      <AlertCircleIcon />
      <AlertTitle>
        {title || "No tienes permisos para acceder a esta página"}
      </AlertTitle>
    </Alert>
  );
}
