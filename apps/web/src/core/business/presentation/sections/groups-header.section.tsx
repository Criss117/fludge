import { Button } from "@/core/shared/components/ui/button";
import { Link } from "@tanstack/react-router";

interface Props {
  businessId: string;
  totalGroups: number;
}

export function GroupsHeaderSection({ totalGroups, businessId }: Props) {
  return (
    <header className="flex justify-between">
      <div>
        <h2 className="text-2xl font-semibold">
          Lista de Grupos ({totalGroups})
        </h2>
        <p className="text-muted-foreground text-sm">
          Los grupos son una forma de organizar los permisos de los empleados.
        </p>
      </div>
      <div className="space-x-2">
        <Button variant="destructive" disabled>
          Eliminar
        </Button>
        <Button asChild>
          <Link
            to="/business/$id/groups/create"
            params={{
              id: businessId,
            }}
          >
            Crear Grupo
          </Link>
        </Button>
      </div>
    </header>
  );
}
