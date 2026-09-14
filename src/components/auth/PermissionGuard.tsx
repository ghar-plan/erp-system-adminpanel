import { Navigate } from "react-router-dom";
import { usePermissions } from "@/hooks/usePermissions";
import { siteRoutes } from "@/utils/helpers/enums/routes.enum";
import type { PermissionMode } from "@/utils/helpers/permissions/types";

type PermissionGuardProps = {
  children: React.ReactNode;
  permission?: string;
  permissions?: string[];
  mode?: PermissionMode;
  explicit?: boolean;
  redirectTo?: string;
};

export default function PermissionGuard({
  children,
  permission,
  permissions,
  mode = "any",
  explicit = false,
  redirectTo = siteRoutes.unauthorized,
}: PermissionGuardProps) {
  const { can, hasExplicitPermission, isSessionReady } = usePermissions();

  if (!isSessionReady) {
    return null;
  }

  const required =
    permission != null ? [permission] : permissions != null ? permissions : [];

  if (required.length === 0) {
    return <>{children}</>;
  }

  const allowed = explicit
    ? mode === "all"
      ? required.every((item) => hasExplicitPermission(item))
      : required.some((item) => hasExplicitPermission(item))
    : can(required, mode);

  if (!allowed) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
