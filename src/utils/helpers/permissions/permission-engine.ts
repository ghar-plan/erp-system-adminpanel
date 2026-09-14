import type { AuthSession, PermissionMode } from "./types";
import {
  expandImpliedReads,
  hasImpliedView,
} from "./permission-implications";

export type PermissionContext = {
  isSuperAdmin: boolean;
  permissions: ReadonlySet<string>;
  assignedPermissions: ReadonlySet<string>;
};

export function buildPermissionContext(
  session: AuthSession | null | undefined,
): PermissionContext {
  const assigned = session?.permissions ?? [];
  return {
    isSuperAdmin: Boolean(session?.isSuperAdmin),
    permissions: expandImpliedReads(assigned),
    assignedPermissions: new Set(assigned),
  };
}

export function checkPermission(
  ctx: PermissionContext,
  permission: string,
): boolean {
  if (ctx.isSuperAdmin) return true;
  if (!permission) return true;
  return hasImpliedView(ctx.permissions, permission);
}

export function checkExplicitPermission(
  ctx: PermissionContext,
  permission: string,
): boolean {
  if (ctx.isSuperAdmin) return true;
  if (!permission) return true;
  return ctx.assignedPermissions.has(permission);
}

export function checkAnyPermission(
  ctx: PermissionContext,
  permissions: string[],
): boolean {
  if (!permissions.length) return true;
  return permissions.some((p) => checkPermission(ctx, p));
}

export function checkAllPermissions(
  ctx: PermissionContext,
  permissions: string[],
): boolean {
  if (!permissions.length) return true;
  return permissions.every((p) => checkPermission(ctx, p));
}

export function checkPermissions(
  ctx: PermissionContext,
  permissions: string[],
  mode: PermissionMode = "any",
): boolean {
  return mode === "all"
    ? checkAllPermissions(ctx, permissions)
    : checkAnyPermission(ctx, permissions);
}

export function toCodename(resource: string, action: string): string {
  return `${resource}.${action}`;
}
