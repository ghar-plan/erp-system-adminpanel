import { siteRoutes } from "@/utils/helpers/enums/routes.enum";
import { PERMISSIONS } from "@/utils/helpers/permissions/permission-constants";

export type MenuLeaf = {
  title: string;
  path: string;
  icon?: string;
  permission?: string;
  anyOf?: string[];
  explicit?: boolean;
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
    text: "Activities",
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
    permission: PERMISSIONS.CONTRACTS_READ,
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
    text: "Roles & Users",
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
        title: "Users",
        path: siteRoutes.users,
        icon: "users",
        permission: PERMISSIONS.USERS_READ,
      },
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
  const check = leaf.explicit ? hasExplicitPermission : hasPermission;
  if (leaf.anyOf?.length) {
    return leaf.explicit
      ? leaf.anyOf.some((permission) => hasExplicitPermission(permission))
      : hasAnyPermission(leaf.anyOf);
  }
  if (leaf.permission) return check(leaf.permission);
  return true;
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
        const children = group.children.filter((c) =>
          leafAllowed(c, hasPermission, hasAnyPermission, hasExplicitPermission),
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
