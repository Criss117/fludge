import { ChevronsUpDown, GalleryVerticalEnd, Plus } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/core/auth/application/providers/auth.provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/core/shared/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/core/shared/components/ui/sidebar";
import type { BusinessDetail } from "@repo/core/entities/business";
import { cn } from "@/core/shared/lib/utils";

interface Props {
  currentBusiness: BusinessDetail;
}

interface BussinesDropDownProps {
  currentBusiness: BusinessDetail;
}

function BusinessDropDown({ currentBusiness }: BussinesDropDownProps) {
  const { user } = useAuth();
  const { isMobile } = useSidebar();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            <GalleryVerticalEnd className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{currentBusiness.name}</span>
          </div>
          <ChevronsUpDown className="ml-auto" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-56 rounded-lg"
        align="start"
        side={isMobile ? "bottom" : "right"}
      >
        <DropdownMenuLabel className="text-muted-foreground text-xs">
          Mis Negocios
        </DropdownMenuLabel>
        {user?.isRootIn.map((business) => (
          <DropdownMenuItem
            key={business.name}
            className={cn(
              "gap-2 p-2",
              currentBusiness.id === business.id && "bg-accent"
            )}
            asChild
          >
            <Link
              to={"/business/$id"}
              params={{
                id: business.id,
              }}
            >
              {business.name}
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 p-2">
          <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
            <Plus className="size-4" />
          </div>
          <Link
            to={"/business/register"}
            className="text-muted-foreground font-medium"
          >
            Agregar negocio
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function BusinessSwitcher({ currentBusiness }: Props) {
  const { user } = useAuth();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {user?.isRoot && <BusinessDropDown currentBusiness={currentBusiness} />}
        {!user?.isRoot && (
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <GalleryVerticalEnd className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">
                {currentBusiness.name}
              </span>
            </div>
          </SidebarMenuButton>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
