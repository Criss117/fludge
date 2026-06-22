import { Link } from "@tanstack/react-router";
import { Alert, AlertTitle, AlertDescription } from "@fludge/ui/components/alert";

interface Props {
  resource: string;
}

export function PermissionDeniedAlert({ resource }: Props) {
  return (
    <div className="p-8">
      <Alert variant="destructive">
        <AlertTitle>Acceso denegado</AlertTitle>
        <AlertDescription>
          No tienes permisos para ver {resource}.{" "}
          <Link to="/" className="underline">
            Volver al inicio
          </Link>
        </AlertDescription>
      </Alert>
    </div>
  );
}