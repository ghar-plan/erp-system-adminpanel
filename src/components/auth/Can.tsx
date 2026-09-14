import type { ReactNode } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import type { PermissionMode } from "@/utils/helpers/permissions/types";

type CanBaseProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

type CanProps = CanBaseProps & {
  permission: string;
};

type CanListProps = CanBaseProps & {
  permissions: string[];
  mode?: PermissionMode;
};

export function Can({ permission, children, fallback = null }: CanProps) {
  const { hasPermission } = usePermissions();
  if (!hasPermission(permission)) return <>{fallback}</>;
  return <>{children}</>;
}

export function CanAny({
  permissions,
  children,
  fallback = null,
}: CanListProps) {
  const { hasAnyPermission } = usePermissions();
  if (!hasAnyPermission(permissions)) return <>{fallback}</>;
  return <>{children}</>;
}

export function CanAll({
  permissions,
  children,
  fallback = null,
}: CanListProps) {
  const { hasAllPermissions } = usePermissions();
  if (!hasAllPermissions(permissions)) return <>{fallback}</>;
  return <>{children}</>;
}

export function CanIf({
  permissions,
  mode = "any",
  children,
  fallback = null,
}: CanListProps) {
  const { can } = usePermissions();
  if (!can(permissions, mode)) return <>{fallback}</>;
  return <>{children}</>;
}

export default Can;
