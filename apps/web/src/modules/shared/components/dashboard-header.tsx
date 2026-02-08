import { createContext, use } from "react";
import { Link, type LinkProps } from "@tanstack/react-router";
import { Separator } from "./ui/separator";
import { cn } from "@/modules/shared/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { SidebarTrigger } from "./ui/sidebar";

type CurrentPath = "Home" | "Products" | "Clients" | "Teams";

interface Context {
  orgSlug: string;
  currentPath: CurrentPath;
}

interface BaseBreadCrumbProps {
  label: string;
  isCurrent: boolean;
  href: {
    to: LinkProps["to"];
    params: LinkProps["params"];
  };
}

interface ContentProps {
  children: React.ReactNode;
  orgSlug: string;
  currentPath?: CurrentPath;
  className?: string;
}

const DashBoardHeaderContext = createContext<Context | null>(null);

function useDashBoardHeader() {
  const context = use(DashBoardHeaderContext);

  if (!context)
    throw new Error(
      "useDashBoardHeader must be used within a DashBoardHeaderProvider",
    );

  return context;
}

function BaseBreadCrumb({ label, isCurrent, href }: BaseBreadCrumbProps) {
  if (isCurrent) {
    return (
      <BreadcrumbItem className="hidden sm:inline-flex">
        <BreadcrumbPage className="font-medium text-foreground text-xl">
          {label}
        </BreadcrumbPage>
      </BreadcrumbItem>
    );
  }

  return (
    <>
      <BreadcrumbItem className="hidden sm:inline-flex">
        <BreadcrumbLink
          className="hover:text-foreground hover:underline underline-offset-4 transition-colors text-xl"
          render={<Link to={href.to} params={href.params} />}
        >
          {label}
        </BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator className="hidden sm:inline-flex" />
    </>
  );
}

function Content({
  children,
  orgSlug,
  currentPath = "Home",
  className,
}: ContentProps) {
  return (
    <header
      className={cn(
        "flex h-14 shrink-0 items-center gap-3 border-b px-4",
        className,
      )}
    >
      <SidebarTrigger className="shrink-0 [&_svg]:size-44" />
      <Separator orientation="vertical" className="h-3/4 my-auto" />
      <DashBoardHeaderContext.Provider value={{ orgSlug, currentPath }}>
        <Breadcrumb className="min-w-0 flex-1">
          <BreadcrumbList className="flex-nowrap overflow-hidden">
            {children}
          </BreadcrumbList>
        </Breadcrumb>
      </DashBoardHeaderContext.Provider>
    </header>
  );
}

function Home({ label = "Inicio" }) {
  const { currentPath, orgSlug } = useDashBoardHeader();

  const isHome = currentPath === "Home";

  return (
    <BaseBreadCrumb
      label={label}
      isCurrent={isHome}
      href={{
        to: "/dashboard/$orgslug",
        params: { orgslug: orgSlug },
      }}
    />
  );
}

function Products({ label = "Productos" }) {
  const { currentPath, orgSlug } = useDashBoardHeader();

  const isCurrent = currentPath === "Products";

  return (
    <BaseBreadCrumb
      label={label}
      isCurrent={isCurrent}
      href={{
        to: "/dashboard/$orgslug/products",
        params: { orgslug: orgSlug },
      }}
    />
  );
}

function Clients({ label = "Clientes" }) {
  const { currentPath, orgSlug } = useDashBoardHeader();

  const isCurrent = currentPath === "Clients";

  return (
    <BaseBreadCrumb
      label={label}
      isCurrent={isCurrent}
      href={{
        to: "/dashboard/$orgslug/clients",
        params: { orgslug: orgSlug },
      }}
    />
  );
}

function Teams({ label = "Equipos" }) {
  const { currentPath, orgSlug } = useDashBoardHeader();

  const isCurrent = currentPath === "Teams";

  return (
    <BaseBreadCrumb
      label={label}
      isCurrent={isCurrent}
      href={{
        to: "/dashboard/$orgslug/teams",
        params: { orgslug: orgSlug },
      }}
    />
  );
}

export const DashBoardHeader = {
  useDashBoardHeader,
  Content,
  Home,
  Products,
  Clients,
  Teams,
};
