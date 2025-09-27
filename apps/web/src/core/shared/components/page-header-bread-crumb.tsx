import { Link } from "@tanstack/react-router";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { Separator } from "./ui/separator";
import { SidebarTrigger } from "./ui/sidebar";

interface PageHeaderProps {
  children: React.ReactNode;
}

interface CommonProps {
  businessId?: string;
  isPage?: boolean;
}

interface Product extends CommonProps {
  productId: string;
  productName: string;
}

interface Category extends CommonProps {
  categoryId: string;
  categoryName: string;
}

interface Group extends CommonProps {
  groupId: string;
  groupName: string;
}

interface Employee extends CommonProps {
  employeeId: string;
  employeeName: string;
}

export function PageHeader({ children }: PageHeaderProps) {
  return (
    <div className="h-10 py-2 flex items-center space-x-2 border-b">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-full" />
      <Breadcrumb>
        <BreadcrumbList>{children}</BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}

export function PageHeaderHome({ businessId, isPage = false }: CommonProps) {
  return (
    <BreadcrumbItem>
      {!isPage && businessId && (
        <BreadcrumbLink asChild>
          <Link
            to="/business/$id"
            params={{ id: businessId }}
            className="text-xl font-semibold"
          >
            Inicio
          </Link>
        </BreadcrumbLink>
      )}
      {isPage && (
        <BreadcrumbItem>
          <BreadcrumbPage className="text-xl font-semibold">
            Inicio
          </BreadcrumbPage>
        </BreadcrumbItem>
      )}
      {!isPage && <BreadcrumbSeparator />}
    </BreadcrumbItem>
  );
}

export function PageHeaderProducts({
  businessId,
  isPage = false,
}: CommonProps) {
  return (
    <BreadcrumbItem>
      {!isPage && businessId && (
        <BreadcrumbLink asChild>
          <Link
            to="/business/$id/products"
            params={{ id: businessId }}
            className="text-xl font-semibold"
          >
            Productos
          </Link>
        </BreadcrumbLink>
      )}
      {isPage && (
        <BreadcrumbItem>
          <BreadcrumbPage className="text-xl font-semibold">
            Productos
          </BreadcrumbPage>
        </BreadcrumbItem>
      )}
      {!isPage && <BreadcrumbSeparator />}
    </BreadcrumbItem>
  );
}

export function PageHeaderProduct({
  businessId,
  isPage = false,
  productId,
  productName,
}: Product) {
  return (
    <BreadcrumbItem>
      {!isPage && businessId && (
        <BreadcrumbLink asChild>
          <Link
            to="/business/$id/products/$productid"
            params={{ id: businessId, productid: productId }}
            className="text-xl font-semibold"
          >
            {productName}
          </Link>
        </BreadcrumbLink>
      )}
      {isPage && (
        <BreadcrumbItem>
          <BreadcrumbPage className="text-xl font-semibold">
            {productName}
          </BreadcrumbPage>
        </BreadcrumbItem>
      )}
      {!isPage && <BreadcrumbSeparator />}
    </BreadcrumbItem>
  );
}

export function PageHeaderCategories({
  businessId,
  isPage = false,
}: CommonProps) {
  return (
    <BreadcrumbItem>
      {!isPage && businessId && (
        <BreadcrumbLink asChild>
          <Link
            to="/business/$id/categories"
            params={{ id: businessId }}
            className="text-xl font-semibold"
          >
            Categorias
          </Link>
        </BreadcrumbLink>
      )}
      {isPage && (
        <BreadcrumbItem>
          <BreadcrumbPage className="text-xl font-semibold">
            Categorias
          </BreadcrumbPage>
        </BreadcrumbItem>
      )}
      {!isPage && <BreadcrumbSeparator />}
    </BreadcrumbItem>
  );
}

export function PageHeaderCategory({
  businessId,
  isPage = false,
  categoryId,
  categoryName,
}: Category) {
  return (
    <BreadcrumbItem>
      {!isPage && businessId && (
        <BreadcrumbLink asChild>
          <Link
            to="/business/$id/categories/$categoryid"
            params={{ id: businessId, categoryid: categoryId }}
            className="text-xl font-semibold"
          >
            {categoryName}
          </Link>
        </BreadcrumbLink>
      )}
      {isPage && (
        <BreadcrumbItem>
          <BreadcrumbPage className="text-xl font-semibold">
            {categoryName}
          </BreadcrumbPage>
        </BreadcrumbItem>
      )}
      {!isPage && <BreadcrumbSeparator />}
    </BreadcrumbItem>
  );
}

export function PageHeaderGroups({ businessId, isPage = false }: CommonProps) {
  return (
    <BreadcrumbItem>
      {!isPage && businessId && (
        <BreadcrumbLink asChild>
          <Link
            to="/business/$id/groups"
            params={{ id: businessId }}
            className="text-xl font-semibold"
          >
            Grupos
          </Link>
        </BreadcrumbLink>
      )}
      {isPage && (
        <BreadcrumbItem>
          <BreadcrumbPage className="text-xl font-semibold">
            Grupos
          </BreadcrumbPage>
        </BreadcrumbItem>
      )}
      {!isPage && <BreadcrumbSeparator />}
    </BreadcrumbItem>
  );
}

export function PageHeaderGroup({
  businessId,
  isPage = false,
  groupId,
  groupName,
}: Group) {
  return (
    <BreadcrumbItem>
      {!isPage && businessId && (
        <BreadcrumbLink asChild>
          <Link
            to="/business/$id/groups/$groupid"
            params={{ id: businessId, groupid: groupId }}
            className="text-xl font-semibold"
          >
            {groupName}
          </Link>
        </BreadcrumbLink>
      )}
      {isPage && (
        <BreadcrumbItem>
          <BreadcrumbPage className="text-xl font-semibold">
            {groupName}
          </BreadcrumbPage>
        </BreadcrumbItem>
      )}
      {!isPage && <BreadcrumbSeparator />}
    </BreadcrumbItem>
  );
}

export function PageHeaderCreateGroup({
  businessId,
  isPage = false,
}: CommonProps) {
  return (
    <BreadcrumbItem>
      {!isPage && businessId && (
        <BreadcrumbLink asChild>
          <Link
            to="/business/$id/groups/create"
            params={{ id: businessId }}
            className="text-xl font-semibold"
          >
            Crear Grupo
          </Link>
        </BreadcrumbLink>
      )}
      {isPage && (
        <BreadcrumbItem>
          <BreadcrumbPage className="text-xl font-semibold">
            Crear Grupo
          </BreadcrumbPage>
        </BreadcrumbItem>
      )}
      {!isPage && <BreadcrumbSeparator />}
    </BreadcrumbItem>
  );
}

export function PageHeaderEmployees({
  businessId,
  isPage = false,
}: CommonProps) {
  return (
    <BreadcrumbItem>
      {!isPage && businessId && (
        <BreadcrumbLink asChild>
          <Link
            to="/business/$id/employees"
            params={{ id: businessId }}
            className="text-xl font-semibold"
          >
            Empleados
          </Link>
        </BreadcrumbLink>
      )}
      {isPage && (
        <BreadcrumbItem>
          <BreadcrumbPage className="text-xl font-semibold">
            Empleados
          </BreadcrumbPage>
        </BreadcrumbItem>
      )}
      {!isPage && <BreadcrumbSeparator />}
    </BreadcrumbItem>
  );
}

export function PageHeaderEmployee({
  businessId,
  isPage = false,
  employeeId,
  employeeName,
}: Employee) {
  return (
    <BreadcrumbItem>
      {!isPage && businessId && (
        <BreadcrumbLink asChild>
          <Link
            to="/business/$id/employees/$employeeid"
            params={{ id: businessId, employeeid: employeeId }}
            className="text-xl font-semibold"
          >
            {employeeName}
          </Link>
        </BreadcrumbLink>
      )}
      {isPage && (
        <BreadcrumbItem>
          <BreadcrumbPage className="text-xl font-semibold">
            {employeeName}
          </BreadcrumbPage>
        </BreadcrumbItem>
      )}
      {!isPage && <BreadcrumbSeparator />}
    </BreadcrumbItem>
  );
}

export function PageHeaderCreateEmployee({
  businessId,
  isPage = false,
}: CommonProps) {
  return (
    <BreadcrumbItem>
      {!isPage && businessId && (
        <BreadcrumbLink asChild>
          <Link
            to="/business/$id/employees/create"
            params={{ id: businessId }}
            className="text-xl font-semibold"
          >
            Crear Empleado
          </Link>
        </BreadcrumbLink>
      )}
      {isPage && (
        <BreadcrumbItem>
          <BreadcrumbPage className="text-xl font-semibold">
            Crear Empleado
          </BreadcrumbPage>
        </BreadcrumbItem>
      )}
      {!isPage && <BreadcrumbSeparator />}
    </BreadcrumbItem>
  );
}
