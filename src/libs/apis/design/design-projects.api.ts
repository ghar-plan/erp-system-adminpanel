import {
  getRequest,
  postRequest,
  patchRequest,
  deleteRequest,
} from "../../../utils/helpers/common/http-methods";

export const DesignProjects_APIS = {
  create: (body: any) => postRequest("/v1/design/projects", body),
  getAll: (params: any = {}) => getRequest("/v1/design/projects", params),
  getAllWithoutPagination: () => getRequest("/v1/design/projects/all"),
  getFilterOptions: () => getRequest("/v1/design/projects/filter-options"),
  getManagerOptions: () => getRequest("/v1/design/projects/manager-options"),
  getAllFinancialStatus: (params: any = {}) =>
    getRequest("/v1/design/projects/financial-status/all", params),
  getById: (id: string) => getRequest(`/v1/design/projects/${id}`),
  update: (id: string, body: any) => patchRequest(`/v1/design/projects/${id}`, body),
  delete: (id: string) => deleteRequest(`/v1/design/projects/${id}`),
  getFinancialStatus: (id: string) =>
    getRequest(`/v1/design/projects/${id}/financial-status`),
  uploadImage: (formData: FormData) =>
    postRequest("/v1/media/upload", formData),
};
