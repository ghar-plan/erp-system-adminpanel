import {
  getRequest,
  postRequest,
  patchRequest,
  deleteRequest,
} from "../../utils/helpers/common/http-methods";

export const Projects_APIS = {
  create: (body: any) => postRequest("/v1/projects", body),
  getAll: (params: any = {}) => getRequest("/v1/projects", params),
  getAllWithoutPagination: () => getRequest("/v1/projects/all"),
  getFilterOptions: () => getRequest("/v1/projects/filter-options"),
  getManagerOptions: () => getRequest("/v1/projects/manager-options"),
  getAllFinancialStatus: (params: any = {}) =>
    getRequest("/v1/projects/financial-status/all", params),
  getById: (id: string) => getRequest(`/v1/projects/${id}`),
  getPullableMaterials: (id: string) =>
    getRequest(`/v1/projects/${id}/pullable-materials`),
  pullMaterials: (id: string, body: any) =>
    postRequest(`/v1/projects/${id}/material-pulls`, body),
  update: (id: string, body: any) => patchRequest(`/v1/projects/${id}`, body),
  delete: (id: string) => deleteRequest(`/v1/projects/${id}`),
  getFinancialStatus: (id: string) =>
    getRequest(`/v1/projects/${id}/financial-status`),
  uploadImage: (formData: FormData) =>
    postRequest("/v1/media/upload", formData),
};
