import { Link } from "@tanstack/react-router";
import { Building2, MapPin, Phone, Mail, Plus } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/modules/shared/components/ui/avatar";
import type { AppRouterClient } from "@fludge/api/routers/index";
import { LinkButton } from "@/modules/shared/components/link-button";

type Organizations = NonNullable<
  Awaited<ReturnType<AppRouterClient["auth"]["getSession"]>>
>["orgs"];

interface Props {
  orgs: Organizations;
}

export function SelectOrganizationsScreen({ orgs }: Props) {
  return (
    <div className="min-h-dvh bg-muted/30 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Selecciona una organización
          </h1>
          <p className="text-muted-foreground">
            Elige la organización con la que deseas trabajar
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {orgs.map((org) => (
            <Link
              key={org.id}
              to="/dashboard/$orgslug"
              params={{ orgslug: org.slug }}
              className="group"
            >
              <div className="bg-background border border-border rounded-xl p-5 transition-all duration-200 hover:shadow-lg hover:border-primary/50 hover:-translate-y-0.5">
                <div className="flex items-start gap-4">
                  <Avatar size="lg" className="shrink-0">
                    <AvatarImage src={org.logo || undefined} alt={org.name} />
                    <AvatarFallback className="bg-primary/10 text-primary text-lg font-medium">
                      <Building2 className="size-6" />
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-foreground text-lg mb-1 truncate">
                      {org.name}
                    </h2>
                    <p className="text-muted-foreground text-sm mb-3 truncate">
                      {org.legalName}
                    </p>

                    <div className="space-y-1.5">
                      {org.address && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <MapPin className="size-3.5 shrink-0" />
                          <span className="truncate">{org.address}</span>
                        </div>
                      )}
                      {org.contactPhone && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Phone className="size-3.5 shrink-0" />
                          <span>{org.contactPhone}</span>
                        </div>
                      )}
                      {org.contactEmail && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Mail className="size-3.5 shrink-0" />
                          <span className="truncate">{org.contactEmail}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <LinkButton
            variant="outline"
            className="gap-2"
            to="/dashboard/register-organization"
          >
            <Plus className="size-4" />
            Crear nueva organización
          </LinkButton>
        </div>
      </div>
    </div>
  );
}
