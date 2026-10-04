import { siteRoutes } from "@/utils/helpers/enums/routes.enum";
import { PERMISSIONS } from "@/utils/helpers/permissions/permission-constants";

export type MenuLeaf = {
  title: string;
  path: string;
  icon?: string;
  permission?: string;
  anyOf?: string[];
  explicit?: boolean;
  children?: MenuLeaf[];
};

export type MenuGroup = {
  key: string;
  text: string;
  path: string;
  permission?: string;
  anyOf?: string[];
  authOnly?: boolean;
  children?: MenuLeaf[];
};

export const menuConfig: MenuGroup[] = [
  {
    key: "dashboard",
    text: "Dashboard",
    path: siteRoutes.dashboard,
    permission: PERMISSIONS.DASHBOARD_READ,
  },
  {
    key: "design",
    text: "Design",
    path: siteRoutes.designProjects,
    children: [
      {
        title: "Projects",
        path: siteRoutes.designProjects,
        icon: "design-projects",
        permission: PERMISSIONS.DESIGN_PROJECTS_READ,
      },
      {
        title: "Comments",
        path: siteRoutes.designComments,
        icon: "design-comments",
        anyOf: [
          PERMISSIONS.DESIGN_COMMENTS_READ,
          PERMISSIONS.DESIGN_PROJECTS_READ,
        ],
      },
      {
        title: "Vendors",
        path: siteRoutes.designVendors,
        icon: "design-vendors",
        permission: PERMISSIONS.DESIGN_VENDORS_READ,
      },
      {
        title: "Material/Services & Stages",
        path: siteRoutes.designActivity,
        icon: "design-activity",
        permission: PERMISSIONS.DESIGN_ACTIVITY_READ,
      },
      {
        title: "Cashflow",
        path: siteRoutes.designCashflow,
        icon: "design-cashflow",
        anyOf: [
          PERMISSIONS.DESIGN_CASH_FLOW_READ,
          PERMISSIONS.DESIGN_CASH_FLOW_EXPORT,
          PERMISSIONS.DESIGN_CASH_FLOW_PRINT,
          PERMISSIONS.DESIGN_CASH_FLOW_IN,
          PERMISSIONS.DESIGN_CASH_FLOW_OUT,
          PERMISSIONS.DESIGN_CASH_FLOW_UPDATE,
          PERMISSIONS.DESIGN_CASH_FLOW_DELETE,
          PERMISSIONS.DESIGN_CASH_FLOW_IMPORT,
        ],
      },
      {
        title: "Prospects",
        path: siteRoutes.designProspects,
        icon: "design-prospects",
        permission: PERMISSIONS.DESIGN_PROSPECT_READ,
      },
      {
        title: "Contracts",
        path: siteRoutes.designContracts,
        icon: "design-contracts",
        children: [
          {
            title: "Vendor Contract",
            path: siteRoutes.designContracts,
            icon: "design-vendor-contract",
            permission: PERMISSIONS.DESIGN_CONTRACTS_READ,
          },
          {
            title: "Client Contract",
            path: siteRoutes.designClientContracts,
            icon: "design-client-contract",
            permission: PERMISSIONS.DESIGN_CONTRACTS_READ,
          },
        ],
      },
      {
        title: "Reports",
        path: siteRoutes.designReportsProjectList,
        icon: "design-reports",
        children: [
          {
            title: "Project List",
            path: siteRoutes.designReportsProjectList,
            icon: "design-project-list",
            permission: PERMISSIONS.DESIGN_REPORTS_PROJECT_LIST,
          },
          {
            title: "Vendor List",
            path: siteRoutes.designReportsVendorList,
            icon: "design-vendor-list",
            permission: PERMISSIONS.DESIGN_REPORTS_VENDOR_LIST,
          },
        ],
      },
    ],
  },
  {
    key: "projects",
    text: "Projects",
    path: siteRoutes.projects,
    permission: PERMISSIONS.CONSTRUCTION_SITE_READ,
  },
  {
    key: "comments",
    text: "Comments",
    path: siteRoutes.comments,
    anyOf: [PERMISSIONS.COMMENTS_READ, PERMISSIONS.CONSTRUCTION_SITE_READ],
  },
  {
    key: "vendors",
    text: "Vendors",
    path: siteRoutes.vendors,
    permission: PERMISSIONS.VENDORS_READ,
  },
  {
    key: "activities",
    text: "Material/Services & Units",
    path: siteRoutes.activity,
    permission: PERMISSIONS.ACTIVITY_READ,
  },
  {
    key: "cashflow",
    text: "Cashflow",
    path: siteRoutes.cashflow,
    anyOf: [
      PERMISSIONS.CASH_FLOW_READ,
      PERMISSIONS.CASH_FLOW_EXPORT,
      PERMISSIONS.CASH_FLOW_PRINT,
      PERMISSIONS.CASH_FLOW_IN,
      PERMISSIONS.CASH_FLOW_OUT,
      PERMISSIONS.CASH_FLOW_UPDATE,
      PERMISSIONS.CASH_FLOW_DELETE,
      PERMISSIONS.CASH_FLOW_IMPORT,
    ],
  },
  {
    key: "prospects",
    text: "Prospects",
    path: siteRoutes.prospects,
    permission: PERMISSIONS.PROSPECT_READ,
  },
  {
    key: "contracts",
    text: "Contracts",
    path: siteRoutes.contracts,
    children: [
      {
        title: "Vendor Contract",
        path: siteRoutes.contracts,
        icon: "vendor-contract",
        permission: PERMISSIONS.CONTRACTS_READ,
      },
      {
        title: "Client Contract",
        path: siteRoutes.clientContracts,
        icon: "client-contract",
        permission: PERMISSIONS.CONTRACTS_READ,
      },
    ],
  },
  {
    key: "reports",
    text: "Reports",
    path: siteRoutes.reportsProjectList,
    children: [
      {
        title: "Project List",
        path: siteRoutes.reportsProjectList,
        icon: "project-list",
        permission: PERMISSIONS.REPORTS_PROJECT_LIST,
      },
      {
        title: "Vendor List",
        path: siteRoutes.reportsVendorList,
        icon: "vendor-list",
        permission: PERMISSIONS.REPORTS_VENDOR_LIST,
      },
    ],
  },
  {
    key: "roles-permissions",
    text: "Stakeholders",
    path: siteRoutes.roles,
    children: [
      {
        title: "Permissions",
        path: siteRoutes.permissions,
        icon: "permissions",
        permission: PERMISSIONS.PERMISSIONS_READ,
      },
      {
        title: "Roles",
        path: siteRoutes.roles,
        icon: "roles",
        permission: PERMISSIONS.ROLES_READ,
      },
      {
        title: "Clients",
        path: siteRoutes.clients,
        icon: "clients",
        permission: PERMISSIONS.CLIENTS_READ,
      },
      {
        title: "Employees",
        path: siteRoutes.employees,
        icon: "employees",
        permission: PERMISSIONS.EMPLOYEE_READ,
      },
      {
        title: "Internal Users",
        path: siteRoutes.users,
        icon: "users",
        permission: PERMISSIONS.USERS_READ,
      },
    ],
  },
  {
    key: "attendance",
    text: "Attendance",
    path: siteRoutes.attendance,
    anyOf: [
      PERMISSIONS.ATTENDANCE_CREATE,
      PERMISSIONS.ATTENDANCE_READ,
      PERMISSIONS.ATTENDANCE_READ_ALL,
    ],
  },
  {
    key: "leaves",
    text: "Leave",
    path: siteRoutes.leaves,
    anyOf: [
      PERMISSIONS.LEAVE_CREATE,
      PERMISSIONS.LEAVE_READ,
      PERMISSIONS.LEAVE_READ_ALL,
      PERMISSIONS.LEAVE_APPROVE,
      PERMISSIONS.LEAVE_REJECT,
    ],
  },
];

type CanFn = (permission: string) => boolean;
type CanAnyFn = (permissions: string[]) => boolean;

function leafAllowed(
  leaf: MenuLeaf,
  hasPermission: CanFn,
  hasAnyPermission: CanAnyFn,
  hasExplicitPermission: CanFn,
): boolean {
  if (leaf.children?.length) {
    return leaf.children.some((child) =>
      leafAllowed(child, hasPermission, hasAnyPermission, hasExplicitPermission),
    );
  }
  const check = leaf.explicit ? hasExplicitPermission : hasPermission;
  if (leaf.anyOf?.length) {
    return leaf.explicit
      ? leaf.anyOf.some((permission) => hasExplicitPermission(permission))
      : hasAnyPermission(leaf.anyOf);
  }
  if (leaf.permission) return check(leaf.permission);
  return true;
}

function filterLeaves(
  leaves: MenuLeaf[],
  hasPermission: CanFn,
  hasAnyPermission: CanAnyFn,
  hasExplicitPermission: CanFn,
): MenuLeaf[] {
  return leaves
    .map((leaf) => {
      if (leaf.children?.length) {
        const children = filterLeaves(
          leaf.children,
          hasPermission,
          hasAnyPermission,
          hasExplicitPermission,
        );
        if (!children.length) return null;
        return {
          ...leaf,
          children,
          path: children[0]?.path ?? leaf.path,
        };
      }
      return leafAllowed(
        leaf,
        hasPermission,
        hasAnyPermission,
        hasExplicitPermission,
      )
        ? leaf
        : null;
    })
    .filter(Boolean) as MenuLeaf[];
}

export function filterMenuByPermissions(
  groups: MenuGroup[],
  hasPermission: CanFn,
  hasAnyPermission: CanAnyFn,
  hasExplicitPermission: CanFn = hasPermission,
): Array<MenuGroup & { children?: MenuLeaf[]; path: string }> {
  return groups
    .map((group) => {
      if (group.children?.length) {
        const children = filterLeaves(
          group.children,
          hasPermission,
          hasAnyPermission,
          hasExplicitPermission,
        );
        if (!children.length) return null;
        return {
          ...group,
          children,
          path: children[0]?.path ?? group.path,
        };
      }

      if (group.authOnly) return group;
      if (group.anyOf?.length) {
        return hasAnyPermission(group.anyOf) ? group : null;
      }
      if (group.permission) {
        return hasPermission(group.permission) ? group : null;
      }
      return group;
    })
    .filter(Boolean) as Array<MenuGroup & { children?: MenuLeaf[]; path: string }>;
}

export function firstAllowedPath(
  hasPermission: CanFn,
  hasAnyPermission: CanAnyFn,
  hasExplicitPermission: CanFn = hasPermission,
): string {
  const visible = filterMenuByPermissions(
    menuConfig,
    hasPermission,
    hasAnyPermission,
    hasExplicitPermission,
  );
  return visible[0]?.path || siteRoutes.profile;
}
