const VIEW_ACTIONS = new Set(["read", "get"]);
const ACTIONS_THAT_IMPLY_VIEW = new Set([
  "create",
  "update",
  "delete",
  "in",
  "out",
  "import",
  "manage",
  "post",
  "put",
  "patch",
  "read_all",
  "approve",
  "reject",
]);

export function splitCodename(permission: string): {
  resource: string;
  action: string;
} {
  const dot = permission.lastIndexOf(".");
  if (dot <= 0) return { resource: permission, action: "" };
  return {
    resource: permission.slice(0, dot),
    action: permission.slice(dot + 1),
  };
}

export function isViewAction(action?: string): boolean {
  return VIEW_ACTIONS.has(String(action || "").trim().toLowerCase());
}

export function actionImpliesView(action?: string): boolean {
  return ACTIONS_THAT_IMPLY_VIEW.has(String(action || "").trim().toLowerCase());
}

export function expandImpliedReads(
  permissions: Iterable<string>,
): Set<string> {
  const expanded = new Set(permissions);
  for (const permission of permissions) {
    const { resource, action } = splitCodename(permission);
    if (resource && actionImpliesView(action)) {
      expanded.add(`${resource}.read`);
    }
  }
  return expanded;
}

export function hasImpliedView(
  permissions: ReadonlySet<string>,
  permission: string,
): boolean {
  if (expandImpliedReads(permissions).has(permission)) return true;
  const { resource, action } = splitCodename(permission);
  if (!resource || !isViewAction(action)) return false;
  const prefix = `${resource}.`;
  for (const assigned of permissions) {
    if (!assigned.startsWith(prefix) || assigned === permission) continue;
    if (actionImpliesView(splitCodename(assigned).action)) return true;
  }
  return false;
}
