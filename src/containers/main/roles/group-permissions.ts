import type { RbacPermission } from "./types";

const MODULE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  vendors: "Vendors",
  construction_site: "Projects",
  activity: "Activities",
  cash_flow: "Cashflow",
  prospect: "Prospects",
  contracts: "Contracts",
  users: "Users",
  roles: "Roles",
  permissions: "Permissions",
  reports: "Reports",
  comments: "Comments",
  super_admin: "Super Admin",
};

const ACTION_LABELS: Record<string, string> = {
  create: "Create",
  read: "View",
  update: "Edit",
  delete: "Delete",
  import: "Import",
  export: "Export",
  print: "Print receipt",
  in: "Record Cash In",
  out: "Record Cash Out",
  manage: "Assign roles",
  project_list: "Project List",
  vendor_list: "Vendor List",
  vendor_filter: "Vendor filter",
};

const PERMISSION_LABELS: Record<string, string> = {
  "dashboard.read": "View dashboard",

  "vendors.create": "Create vendor",
  "vendors.read": "View vendors",
  "vendors.update": "Edit vendor",
  "vendors.delete": "Delete vendor",

  "construction_site.create": "Create project",
  "construction_site.read": "View projects",
  "construction_site.update": "Edit project",
  "construction_site.delete": "Delete project",

  "activity.create": "Create activity",
  "activity.read": "View activities",
  "activity.update": "Edit activity",
  "activity.delete": "Delete activity",
  "activity.import": "Import CSV",
  "activity.export": "Export activities",

  "cash_flow.read": "View transactions",
  "cash_flow.update": "Edit transaction",
  "cash_flow.delete": "Delete transaction",
  "cash_flow.in": "Record Cash In",
  "cash_flow.out": "Record Cash Out",
  "cash_flow.print": "Print receipt",
  "cash_flow.export": "Export PDF",
  "cash_flow.import": "Import cashflow",

  "prospect.create": "Create prospect",
  "prospect.read": "View prospects",
  "prospect.update": "Edit prospect",
  "prospect.delete": "Delete prospect",

  "contracts.create": "Create contract",
  "contracts.read": "View contracts",
  "contracts.update": "Edit contract",
  "contracts.delete": "Delete contract",

  "users.create": "Create user",
  "users.read": "View users",
  "users.update": "Edit user",
  "users.delete": "Delete user",

  "roles.create": "Create role",
  "roles.read": "View roles",
  "roles.update": "Edit role",
  "roles.delete": "Delete role",
  "roles.manage": "Assign roles to users",

  "permissions.read": "View permissions",
  "permissions.update": "Enable or disable permissions",

  "reports.project_list": "Project List",
  "reports.vendor_list": "Vendor List",
  "reports.vendor_filter": "Vendor filter",

  "comments.create": "Add comments",
  "comments.read": "View comments",
  "comments.update": "Edit comments",
  "comments.delete": "Delete comments",
};

export function toPermissionCodename(permission: {
  resource?: string;
  action?: string;
  codename?: string;
}): string {
  if (permission.codename) return permission.codename;
  if (permission.resource && permission.action) {
    return `${permission.resource}.${permission.action}`;
  }
  return "";
}

export function mapCatalogPermission(raw: any): RbacPermission {
  const resource = raw.resource || "other";
  const action = raw.action || "";
  return {
    id: raw.id,
    action,
    resource,
    codename: toPermissionCodename(raw),
    status: raw.status !== false,
  };
}

export function groupPermissionsByModule(
  perms: RbacPermission[],
): Array<[string, RbacPermission[]]> {
  const map = new Map<string, RbacPermission[]>();
  for (const p of perms) {
    if (p.resource === "super_admin") continue;
    if (p.resource === "dashboard" && p.action !== "read") continue;
    if (p.resource === "cash_flow" && p.action === "create") continue;
    const mod = p.resource || "other";
    if (!map.has(mod)) map.set(mod, []);
    map.get(mod)!.push(p);
  }
  return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
}

export function formatModuleLabel(module: string): string {
  return MODULE_LABELS[module] || module.replace(/_/g, " ");
}

export function formatPermissionLabel(permission: {
  action?: string;
  resource?: string;
  codename?: string;
}): string {
  const codename = toPermissionCodename(permission);
  if (codename && PERMISSION_LABELS[codename]) {
    return PERMISSION_LABELS[codename];
  }
  if (permission.action && ACTION_LABELS[permission.action]) {
    return ACTION_LABELS[permission.action];
  }
  return (permission.action || codename || "Permission").replace(/_/g, " ");
}

function titleCaseWords(value: string) {
  return value
    .split(/[._\s-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function formatReadableCode(permission: {
  action?: string;
  resource?: string;
  codename?: string;
}): string {
  const resource = permission.resource || permission.codename?.split(".")[0] || "";
  const action = permission.action || permission.codename?.split(".")[1] || "";
  const modulePart = MODULE_LABELS[resource] || titleCaseWords(resource);
  const actionPart = titleCaseWords(action);
  if (modulePart && actionPart) return `${modulePart} · ${actionPart}`;
  return titleCaseWords(toPermissionCodename(permission));
}
