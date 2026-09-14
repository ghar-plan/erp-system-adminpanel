import {
  deleteRequest,
  patchRequest,
  postRequest,
} from "../../utils/helpers/common/http-methods";

export const Users_APIS = {
  createUser: (body: {
    fullName: string;
    title?: string;
    email: string;
    roleIds: string[];
  }) => postRequest("/v1/users", body),
  setStatus: (id: string, status: boolean) =>
    patchRequest(`/v1/users/${id}/status`, { status }),
  deleteUser: (id: string) => deleteRequest(`/v1/users/${id}`),
  updateProfile: (body: any) => patchRequest("/v1/users", body),
};
