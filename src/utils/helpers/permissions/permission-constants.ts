export const PERMISSIONS = {
  DASHBOARD_READ: "dashboard.read",

  VENDORS_CREATE: "vendors.create",
  VENDORS_READ: "vendors.read",
  VENDORS_UPDATE: "vendors.update",
  VENDORS_DELETE: "vendors.delete",

  CONSTRUCTION_SITE_CREATE: "__LEGACY_CONSTRUCTION_SITE__.create",
  CONSTRUCTION_SITE_READ: "__LEGACY_CONSTRUCTION_SITE__.read",
  CONSTRUCTION_SITE_UPDATE: "__LEGACY_CONSTRUCTION_SITE__.update",
  CONSTRUCTION_SITE_DELETE: "__LEGACY_CONSTRUCTION_SITE__.delete",

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

  // Design module permissions
  DESIGN_PROJECTS_CREATE: "design_projects.create",
  DESIGN_PROJECTS_READ: "design_projects.read",
  DESIGN_PROJECTS_UPDATE: "design_projects.update",
  DESIGN_PROJECTS_DELETE: "design_projects.delete",

  DESIGN_VENDORS_CREATE: "design_vendors.create",
  DESIGN_VENDORS_READ: "design_vendors.read",
  DESIGN_VENDORS_UPDATE: "design_vendors.update",
  DESIGN_VENDORS_DELETE: "design_vendors.delete",

  DESIGN_ACTIVITY_CREATE: "design_activity.create",
  DESIGN_ACTIVITY_READ: "design_activity.read",
  DESIGN_ACTIVITY_UPDATE: "design_activity.update",
  DESIGN_ACTIVITY_DELETE: "design_activity.delete",
  DESIGN_ACTIVITY_IMPORT: "design_activity.import",
  DESIGN_ACTIVITY_EXPORT: "design_activity.export",

  DESIGN_CASH_FLOW_READ: "design_cash_flow.read",
  DESIGN_CASH_FLOW_UPDATE: "design_cash_flow.update",
  DESIGN_CASH_FLOW_DELETE: "design_cash_flow.delete",
  DESIGN_CASH_FLOW_IN: "design_cash_flow.in",
  DESIGN_CASH_FLOW_OUT: "design_cash_flow.out",
  DESIGN_CASH_FLOW_PRINT: "design_cash_flow.print",
  DESIGN_CASH_FLOW_EXPORT: "design_cash_flow.export",
  DESIGN_CASH_FLOW_IMPORT: "design_cash_flow.import",

  DESIGN_PROSPECT_CREATE: "design_prospect.create",
  DESIGN_PROSPECT_READ: "design_prospect.read",
  DESIGN_PROSPECT_UPDATE: "design_prospect.update",
  DESIGN_PROSPECT_DELETE: "design_prospect.delete",

  DESIGN_CONTRACTS_CREATE: "design_contracts.create",
  DESIGN_CONTRACTS_READ: "design_contracts.read",
  DESIGN_CONTRACTS_UPDATE: "design_contracts.update",
  DESIGN_CONTRACTS_DELETE: "design_contracts.delete",

  DESIGN_COMMENTS_CREATE: "design_comments.create",
  DESIGN_COMMENTS_READ: "design_comments.read",
  DESIGN_COMMENTS_UPDATE: "design_comments.update",
  DESIGN_COMMENTS_DELETE: "design_comments.delete",

  DESIGN_REPORTS_PROJECT_LIST: "design_reports.project_list",
  DESIGN_REPORTS_VENDOR_LIST: "design_reports.vendor_list",
  DESIGN_REPORTS_VENDOR_FILTER: "design_reports.vendor_filter",
} as const;

export type PermissionCodename =
  (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
