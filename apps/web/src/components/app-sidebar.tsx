import { Link, useLocation } from "@tanstack/react-router";
import { Archive, Home, Settings, UserRound, Wallet } from "lucide-react";
import { Separator } from "@fludge/ui/components/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@fludge/ui/components/sidebar";
import { cn } from "@fludge/ui/lib/utils";

const NavItems = [
  { name: "Dashboard", href: "/", Icon: Home },
  { name: "Inventario", href: "/inventory", Icon: Archive },
  { name: "Ventas", href: "/sales", Icon: Wallet },
  { name: "Clientes", href: "/clients", Icon: UserRound },
  { name: "Configuración", href: "/settings", Icon: Settings },
] as const;

export function AppSidebar() {
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === "/" && location.pathname === "/") {
      return true;
    }

    return location.pathname === href;
  };

  return (
    <Sidebar variant="inset" collapsible="offcanvas">
      <SidebarHeader className="mb-4">
        <h1 className="text-4xl text-sidebar-primary font-black">Fludge</h1>
        <p className="text-muted-foreground text-sm">POS de trabajo</p>
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
