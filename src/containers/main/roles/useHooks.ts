import { Roles_APIS } from "@/libs/apis/roles.api";
import {
  confirmationPopup,
  errorToaster,
  successToaster,
} from "@/utils/helpers/common/alert-service";
import { mapCatalogPermission, toPermissionCodename } from "./group-permissions";
import type { RbacPermission, RbacRole } from "./types";

export const SYSTEM_ROLE_NAMES = ["superAdmin", "vendor", "user", "admin", "client", "employee"];

export const isSystemRole = (name?: string) =>
  SYSTEM_ROLE_NAMES.includes(String(name || "").trim());

const getRoleErrorMessage = (response: any, fallback: string) => {
  const message = response?.message;
  if (typeof message === "string" && message.trim() && !message.trim().startsWith("{")) {
    return message;
  }
  if (typeof response?.error === "string" && response.error !== "Bad Request") {
    return response.error;
  }
  return fallback;
};

const useRoles = () => {
  const getRolesList = async (
    setList: (rows: RbacRole[]) => void,
    queryParams: Record<string, unknown>,
    setTotal: (total: number) => void,
  ) => {
    const response = await Roles_APIS.getRoles(queryParams);
    if (response?.status) {
      const rows = (response.data || [])
        .filter((role: any) => !isSystemRole(role.name))
        .map((role: any) => ({
          ...role,
          permissions: (role.permissions || []).map(mapCatalogPermission),
        }));
      setList(rows);
      setTotal(response.total ?? rows.length);
      return;
    }
    setList([]);
    setTotal(0);
  };

  const getRoleDetail = async (
    id: string,
    setRole?: (role: RbacRole | null) => void,
  ) => {
    const response = await Roles_APIS.getRoleById(id);
    if (response?.status && response.data) {
      if (isSystemRole(response.data.name)) {
        setRole?.(null);
        return null;
      }
      const role = {
        ...response.data,
        permissions: (response.data.permissions || []).map(mapCatalogPermission),
      };
      setRole?.(role);
      return role as RbacRole;
    }
    setRole?.(null);
    return null;
  };

  const getPermissionsCatalog = async (
    setCatalog: (rows: RbacPermission[]) => void,
  ) => {
    const response = await Roles_APIS.getPermissionsCatalog();
    if (response?.status) {
      setCatalog((response.data || []).map(mapCatalogPermission));
      return;
    }
    setCatalog([]);
  };

  const createRole = async (
    body: { name: string; permissions: string[] },
    onSuccess?: (created?: { id?: string }) => void,
  ) => {
    const response = await Roles_APIS.createRole(body);
    if (response?.status === true) {
      successToaster(response.message || "Role created successfully");
      const createdId = response.data?.id || response.id;
      onSuccess?.({ id: createdId });
      return true;
    }
    if (!response?.toasted) {
      errorToaster(getRoleErrorMessage(response, "Failed to create role"));
    }
    return false;
  };

  const updateRole = async (
    id: string,
    body: { name: string; permissions: string[] },
    onSuccess?: () => void,
  ) => {
    const response = await Roles_APIS.updateRole(id, body);
    if (response?.status === true) {
      successToaster(response.message || "Role updated successfully");
      onSuccess?.();
      return true;
    }
    if (!response?.toasted) {
      errorToaster(getRoleErrorMessage(response, "Failed to update role"));
    }
    return false;
  };

  const setRoleStatus = async (
    id: string,
    status: boolean,
    onSuccess?: () => void,
  ) => {
    const response = await Roles_APIS.setRoleStatus(id, status);
    if (response?.status === true) {
      successToaster(
        response.message ||
          (status ? "Role enabled successfully" : "Role disabled successfully"),
      );
      onSuccess?.();
      return true;
    }
    if (!response?.toasted) {
      errorToaster(response?.message || "Failed to update role status");
    }
    return false;
  };

  const deleteRole = async (id: string, name: string, onSuccess?: () => void) => {
    const confirm = await confirmationPopup(
      "Delete this role?",
      `Are you sure you want to delete “${name}”? Users with this role will lose access.`,
    );
    if (!confirm.isConfirmed) return false;
    const response = await Roles_APIS.deleteRole(id);
    if (response?.status) {
      successToaster(response.message || "Role deleted successfully");
      onSuccess?.();
      return true;
    }
    errorToaster(response?.message || "Failed to delete role");
    return false;
  };

  const getUsersWithRoles = async (
    setList: (rows: any[]) => void,
    queryParams: Record<string, unknown>,
    setTotal: (total: number) => void,
  ) => {
    const response = await Roles_APIS.getUsersWithRoles(queryParams);
    if (response?.status) {
      const rows = (response.data || []).filter((row: any) => {
        const roleNames = (row.assignedRoles || []).map((role: any) => role?.name);
        return !roleNames.some((name: string) => name === "superAdmin");
      });
      setList(rows);
      setTotal(response.total ?? rows.length);
      return;
    }
    setList([]);
    setTotal(0);
  };

  const assignRole = async (
    userId: string,
    roleIds: string[],
    onSuccess?: () => void,
  ) => {
    const response = await Roles_APIS.assignRole({ userId, roleIds });
    if (response?.status) {
      successToaster(response.message || "Roles assigned successfully");
      onSuccess?.();
      return true;
    }
    if (!response?.toasted) {
      errorToaster(response?.message || "Failed to assign roles");
    }
    return false;
  };

  const permissionIdsFromCodenames = (
    catalog: RbacPermission[],
    selected: Set<string>,
  ) =>
    catalog
      .filter((permission) => selected.has(toPermissionCodename(permission)))
      .map((permission) => permission.id);

  return {
    getRolesList,
    getRoleDetail,
    getPermissionsCatalog,
    createRole,
    updateRole,
    setRoleStatus,
    deleteRole,
    getUsersWithRoles,
    assignRole,
    permissionIdsFromCodenames,
  };
};

export default useRoles;
