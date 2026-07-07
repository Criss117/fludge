import { formatDistance } from "date-fns";
import { es } from "date-fns/locale/es";

import { useFindGroupHistory } from "@/modules/iam/hooks/use-find-group-history";
import { Badge } from "@fludge/ui/components/badge";

interface Props {
  groupId: string;
}

const ACTION_LABEL: Record<string, string> = {
  update: "Actualizado",
  activate: "Activado",
  deactivate: "Desactivado",
};

const ACTION_BADGE_VARIANT: Record<
  string,
  "default" | "secondary" | "outline"
> = {
  update: "default",
  activate: "secondary",
  deactivate: "outline",
};

export function GroupHistorySection({ groupId }: Props) {
  const { data: history } = useFindGroupHistory(groupId);

  if (history.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Este grupo aún no tiene historial de cambios.
      </p>
    );
  }

  return (
    <ol className="relative space-y-4 border-l pl-4">
      {history.map((entry) => {
        const label = ACTION_LABEL[entry.action] ?? entry.action;
        const variant = ACTION_BADGE_VARIANT[entry.action] ?? "secondary";

        return (
          <li key={entry.id} className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant={variant}>{label}</Badge>
              <span className="text-sm font-medium">
                {entry.actorName ?? "—"}
              </span>
              <span className="text-xs text-muted-foreground">
                hace{" "}
                {formatDistance(entry.createdAt, new Date(), {
                  locale: es,
                })}
              </span>
            </div>
            {entry.description ? (
              <p className="text-sm text-muted-foreground">
                {entry.description}
              </p>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}