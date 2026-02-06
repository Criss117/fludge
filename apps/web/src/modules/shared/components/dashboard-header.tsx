import { createContext, use } from "react";
import { Link } from "@tanstack/react-router";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";

type CurrentPath = "Home" | "Products";

interface Context {
  orgSlug: string;
  currentPath: CurrentPath;
}

interface ContentProps {
  children: React.ReactNode;
  orgSlug: string;
  currentPath?: CurrentPath;
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

function Content({ children, orgSlug, currentPath = "Home" }: ContentProps) {
  return (
    <DashBoardHeaderContext.Provider value={{ orgSlug, currentPath }}>
      <Breadcrumb>
        <BreadcrumbList>{children}</BreadcrumbList>
      </Breadcrumb>
    </DashBoardHeaderContext.Provider>
  );
}

function Home({ label = "Inicio" }) {
  const { orgSlug, currentPath } = useDashBoardHeader();

  const isHome = currentPath === "Home";

  return (
    <BreadcrumbList>
      <BreadcrumbItem>
        {isHome ? (
          <BreadcrumbItem>
            <BreadcrumbPage>{label}</BreadcrumbPage>
          </BreadcrumbItem>
        ) : (
          <BreadcrumbLink
            render={
              <Link to="/dashboard/$orgslug" params={{ orgslug: orgSlug }} />
            }
          >
            {label}
          </BreadcrumbLink>
        )}
      </BreadcrumbItem>
      {!isHome && <BreadcrumbSeparator />}
    </BreadcrumbList>
  );
}

export const DashBoardHeader = { Content, Home, useDashBoardHeader };
