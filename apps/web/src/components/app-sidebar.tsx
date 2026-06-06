import { Link, useLocation } from "@tanstack/react-router";
import {
  Archive,
  BookUser,
  Boxes,
  Building,
  ChartBar,
  Home,
  UserRound,
  Wallet,
} from "lucide-react";
import { Separator } from "@fludge/ui/components/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@fludge/ui/components/sidebar";
import { cn } from "@fludge/ui/lib/utils";
import { useFindActiveOrganization } from "@fludge/client/application/iam/hooks/use-organization-queries";
import { Button } from "@fludge/ui/components/button";

const NavItems = [
  { name: "Dashboard", href: "/", Icon: Home },
  { name: "Inventario", href: "/inventory", Icon: Archive },
  { name: "Ventas", href: "/sales", Icon: Wallet },
  { name: "Analiticas", href: "/analytics", Icon: ChartBar },
  { name: "Clientes", href: "/clients", Icon: UserRound },
  { name: "Grupos", href: "/groups", Icon: Boxes },
  { name: "Miembros", href: "/members", Icon: BookUser },
] as const;

export function AppSidebar() {
  const location = useLocation();
  const { open } = useSidebar();
  const { data: organization } = useFindActiveOrganization();

  const isActive = (href: string) => {
    if (href === "/" && location.pathname === "/") {
      return true;
    }

    return location.pathname === href;
  };

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="mb-4 ">
        <div className="flex flex-row items-center justify-center">
          {open ? (
            <h1 className="text-xl text-sidebar-primary font-black line-clamp-2">
              {organization?.name}
            </h1>
          ) : (
            <Building size={24} />
          )}
        </div>
        <Button
          nativeButton={false}
          render={(props) => <Link to="/organization/select" {...props} />}
        >
          <Building size={24} />
          <span>Seleccionar organización</span>
        </Button>
      </SidebarHeader>
      <Separator />
      <SidebarContent className="mt-4">
        <SidebarGroup className="space-y-4">
          {NavItems.map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton
                className={cn(isActive(item.href) && "bg-accent")}
                render={(props) => <Link {...props} to={item.href} />}
              >
                <item.Icon />
                <span className="text-base">{item.name}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
