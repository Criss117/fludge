import type { BusinessDetail } from "@repo/core/entities/business";
import { createContext, use, useState } from "react";
import { useAuth } from "./auth.provider";
import { checkUserPermissions } from "@/core/shared/lib/user-permission";
import type { Permission } from "@repo/core/value-objects/permission";

interface Context {
  currentBusiness: BusinessDetail | null;
  initialState: (currentBusiness: BusinessDetail) => void;
  userHasPermissions: (...permissions: Permission[]) => boolean;
}

const PermissionsContext = createContext<Context | null>(null);

export function usePermissions() {
  const context = use(PermissionsContext);

  if (!context) {
    throw new Error("usePermissions must be used within a PermissionsProvider");
  }

  return context;
}

export function PermissionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [currentBusiness, setCurrentBusiness] = useState<BusinessDetail | null>(
    null
  );

  if (!user) {
    return null;
  }

  const initialState = (currentBusiness: BusinessDetail) => {
    setCurrentBusiness(currentBusiness);
  };

  const userHasPermissions = (...permissions: Permission[]) => {
    if (!currentBusiness) {
      return false;
    }

    if (user.isRoot && currentBusiness.rootUserId === user.id) {
      return true;
    }

    return checkUserPermissions(user, permissions);
  };

  return (
    <PermissionsContext.Provider
      value={{
        currentBusiness,
        initialState,
        userHasPermissions,
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
}
