import { useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import type { AuthSession, PermissionMode } from "@/utils/helpers/permissions/types";
import {
  buildPermissionContext,
  checkAllPermissions,
  checkAnyPermission,
  checkExplicitPermission,
  checkPermission,
} from "@/utils/helpers/permissions/permission-engine";

export function usePermissions() {
  const session = useAppSelector(
    (state) => state.sharedReducer.userData as AuthSession | null,
  );
  const sessionStatus = useAppSelector(
    (state) => state.sharedReducer.sessionStatus,
  );

  const ctx = useMemo(() => buildPermissionContext(session), [session]);

  return useMemo(
    () => ({
      session,
      sessionStatus,
      isSessionReady: sessionStatus === "ready",
      isSuperAdmin: ctx.isSuperAdmin,
      isClient: session?.isClient === true,
      permissions: session?.permissions ?? [],

      hasPermission: (permission: string) => checkPermission(ctx, permission),

      hasExplicitPermission: (permission: string) =>
        checkExplicitPermission(ctx, permission),

      hasAnyPermission: (permissions: string[]) =>
        checkAnyPermission(ctx, permissions),

      hasAllPermissions: (permissions: string[]) =>
        checkAllPermissions(ctx, permissions),

      can: (permissions: string | string[], mode: PermissionMode = "any") => {
        if (typeof permissions === "string") {
          return checkPermission(ctx, permissions);
        }
        return mode === "all"
          ? checkAllPermissions(ctx, permissions)
          : checkAnyPermission(ctx, permissions);
      },

      roleName: session?.currentRole || session?.role?.name || "",
      roleSlug: session?.role?.slug || "",
    }),
    [ctx, session, sessionStatus],
  );
}

export default usePermissions;
