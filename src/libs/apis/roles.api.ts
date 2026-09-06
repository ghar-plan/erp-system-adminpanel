import {
  deleteRequest,
  getRequest,
  patchRequest,
  postRequest,
  putRequest,
} from "../../utils/helpers/common/http-methods";

export const Roles_APIS = {
  getRoles: (params?: Record<string, unknown>) =>
    getRequest("/v1/roles", params),
  getRoleById: (id: string) => getRequest(`/v1/roles/detail/${id}`),
  getPermissionsCatalog: () => getRequest("/v1/roles/permissions/catalog"),
  createRole: (body: { name: string; permissions?: string[] }) =>
    postRequest("/v1/roles/create-role", body),
  updateRole: (id: string, body: { name: string; permissions?: string[] }) =>
    putRequest(`/v1/roles/update-role/${id}`, body),
  setRoleStatus: (id: string, status: boolean) =>
    patchRequest(`/v1/roles/update-role/${id}/status`, { status }),
  deleteRole: (id: string) => deleteRequest(`/v1/roles/delete-role/${id}`),
  getUsersWithRoles: (params?: Record<string, unknown>) =>
    getRequest("/v1/roles/user-with-assigned-roles", params),
  assignRole: (body: { userId: string; roleIds: string[] }) =>
    postRequest("/v1/roles/assign-role-to-user", body),
};
