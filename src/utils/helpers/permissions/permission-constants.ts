export const PERMISSIONS = {
  DASHBOARD_READ: "dashboard.read",

  VENDORS_CREATE: "vendors.create",
  VENDORS_READ: "vendors.read",
  VENDORS_UPDATE: "vendors.update",
  VENDORS_DELETE: "vendors.delete",

  CONSTRUCTION_SITE_CREATE: "construction_site.create",
  CONSTRUCTION_SITE_READ: "construction_site.read",
  CONSTRUCTION_SITE_UPDATE: "construction_site.update",
  CONSTRUCTION_SITE_DELETE: "construction_site.delete",

  ACTIVITY_CREATE: "activity.create",
  ACTIVITY_READ: "activity.read",
  ACTIVITY_UPDATE: "activity.update",
  ACTIVITY_DELETE: "activity.delete",
  ACTIVITY_IMPORT: "activity.import",
  ACTIVITY_EXPORT: "activity.export",

  CASH_FLOW_READ: "cash_flow.read",
  CASH_FLOW_UPDATE: "cash_flow.update",
  CASH_FLOW_DELETE: "cash_flow.delete",
  CASH_FLOW_IN: "cash_flow.in",
  CASH_FLOW_OUT: "cash_flow.out",
  CASH_FLOW_PRINT: "cash_flow.print",
  CASH_FLOW_EXPORT: "cash_flow.export",
  CASH_FLOW_IMPORT: "cash_flow.import",

  PROSPECT_CREATE: "prospect.create",
  PROSPECT_READ: "prospect.read",
  PROSPECT_UPDATE: "prospect.update",
  PROSPECT_DELETE: "prospect.delete",

  CONTRACTS_CREATE: "contracts.create",
  CONTRACTS_READ: "contracts.read",
  CONTRACTS_UPDATE: "contracts.update",
  CONTRACTS_DELETE: "contracts.delete",

  USERS_CREATE: "users.create",
  USERS_READ: "users.read",
  USERS_UPDATE: "users.update",
  USERS_DELETE: "users.delete",

  CLIENTS_READ: "clients.read",
  CLIENTS_DELETE: "clients.delete",

  ROLES_CREATE: "roles.create",
  ROLES_READ: "roles.read",
  ROLES_UPDATE: "roles.update",
  ROLES_DELETE: "roles.delete",
  ROLES_MANAGE: "roles.manage",

  PERMISSIONS_READ: "permissions.read",
  PERMISSIONS_UPDATE: "permissions.update",

  REPORTS_PROJECT_LIST: "reports.project_list",
  REPORTS_VENDOR_LIST: "reports.vendor_list",
  REPORTS_VENDOR_FILTER: "reports.vendor_filter",

  COMMENTS_CREATE: "comments.create",
  COMMENTS_READ: "comments.read",
  COMMENTS_UPDATE: "comments.update",
  COMMENTS_DELETE: "comments.delete",

  EMPLOYEE_CREATE: "employee.create",
  EMPLOYEE_READ: "employee.read",
  EMPLOYEE_UPDATE: "employee.update",
  EMPLOYEE_DELETE: "employee.delete",

  ATTENDANCE_CREATE: "attendance.create",
  ATTENDANCE_READ: "attendance.read",
  ATTENDANCE_READ_ALL: "attendance.read_all",
  ATTENDANCE_UPDATE: "attendance.update",
  ATTENDANCE_DELETE: "attendance.delete",

  LEAVE_CREATE: "leave.create",
  LEAVE_READ: "leave.read",
  LEAVE_READ_ALL: "leave.read_all",
  LEAVE_APPROVE: "leave.approve",
  LEAVE_REJECT: "leave.reject",
  LEAVE_UPDATE: "leave.update",
  LEAVE_DELETE: "leave.delete",
} as const;

export type PermissionCodename =
  (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
