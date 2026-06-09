import type { ORPCType } from "@fludge/client/providers/orpc.provider";
import { useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { useSetActiveOrganization } from "@/modules/iam/hooks/use-set-active-organization";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@fludge/ui/components/card";
import { Skeleton } from "@fludge/ui/components/skeleton";
import { SearchInput } from "@fludge/ui/components/search-input";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@fludge/ui/components/avatar";
import { toast } from "sonner";

interface Props {
  organizations: Awaited<
    ReturnType<ORPCType["organizations"]["queries"]["findAll"]["call"]>
  >;
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

function getMetadata(org: {
  legalName?: string | null;
  taxId?: string | null;
  address?: string | null;
}): string | null {
  return org.legalName || org.taxId || org.address || null;
}

export function SelectOrganizationScreen({ organizations }: Props) {
  const setActiveOrganization = useSetActiveOrganization();
  const [search, setSearch] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const autoSelectedRef = useRef(false);

  const showSearch = organizations.length > 6;

  const filtered = showSearch
    ? organizations.filter((org) => {
        const q = search.toLowerCase();
        return (
          org.name.toLowerCase().includes(q) ||
          org.slug.toLowerCase().includes(q) ||
          (org.legalName != null && org.legalName.toLowerCase().includes(q))
        );
      })
    : organizations;

  const handleClick = (org: { id: string; slug: string }) => {
    setPendingId(org.id);
    setActiveOrganization.mutate(org, {
      onSettled: () => setPendingId(null),
      onError: (error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "Error al seleccionar organización",
        );
      },
      onSuccess: () => {
        window.location.replace("/");
      },
    });
  };

  useEffect(() => {
    if (organizations.length === 1 && !autoSelectedRef.current) {
      autoSelectedRef.current = true;
      handleClick(organizations[0]!);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizations.length]);

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Seleccionar Organización</CardTitle>
          <CardDescription>
            Elige una organización para continuar
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {showSearch && (
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Buscar organización…"
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((org) => (
              <Card
                key={org.id}
                size="sm"
                role="button"
                tabIndex={0}
                aria-label={`Seleccionar organización ${org.name}`}
                aria-disabled={pendingId === org.id}
                onClick={() => pendingId === null && handleClick(org)}
                onKeyDown={(e) => {
                  if (
                    (e.key === "Enter" || e.key === " ") &&
                    pendingId === null
                  ) {
                    e.preventDefault();
                    handleClick(org);
                  }
                }}
                className="cursor-pointer hover:bg-muted transition-colors"
              >
                <CardHeader>
                  <Avatar size="lg">
                    {org.logo && <AvatarImage src={org.logo} alt={org.name} />}
                    <AvatarFallback>
                      {getInitials(org.name)}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle>{org.name}</CardTitle>
                  {getMetadata(org) && (
                    <CardDescription>{getMetadata(org)}</CardDescription>
                  )}
                </CardHeader>
                {pendingId === org.id && (
                  <CardFooter>
                    <Skeleton className="h-3 w-20" />
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              No se encontraron organizaciones.
            </p>
          )}
        </CardContent>

        <CardFooter>
          <p className="text-xs text-muted-foreground">
            ¿Necesitas crear una?{" "}
            <Link
              to="/organization/register"
              className="text-primary underline-offset-4 hover:underline"
            >
              Registrar organización
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export function SelectOrganizationScreenSkeleton() {
  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-9 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-3 w-48" />
        </CardFooter>
      </Card>
    </div>
  );
}