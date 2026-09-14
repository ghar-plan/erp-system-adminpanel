import {
  deleteRequest,
  getRequest,
  patchRequest,
  postRequest,
} from "../../utils/helpers/common/http-methods";

export const Employees_APIS = {
  create: (body: any) => postRequest("/v1/employees", body),
  getAll: (params: any = {}) => getRequest("/v1/employees", params),
  getAllWithoutPagination: () => getRequest("/v1/employees/all"),
  getMe: () => getRequest("/v1/employees/me"),
  getById: (id: string) => getRequest(`/v1/employees/${id}`),
  getAttendance: (id: string, params: any = {}) =>
    getRequest(`/v1/employees/${id}/attendance`, params),
  getLeaves: (id: string, params: any = {}) =>
    getRequest(`/v1/employees/${id}/leaves`, params),
  update: (id: string, body: any) => patchRequest(`/v1/employees/${id}`, body),
  delete: (id: string) => deleteRequest(`/v1/employees/${id}`),
};
