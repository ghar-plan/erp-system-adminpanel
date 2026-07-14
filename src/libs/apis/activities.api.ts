import {
  getRequest,
  postRequest,
  patchRequest,
  deleteRequest,
} from "../../utils/helpers/common/http-methods";

export const Activities_APIS = {
  create: (body: any) => postRequest("/v1/activities", body),
  createBulk: (body: any) => postRequest("/v1/activities/bulk", body),
  uploadCsv: (formData: FormData) => postRequest("/v1/activities/upload", formData),
  getAll: (params: any = {}) => getRequest("/v1/activities", params),
  getAllWithoutPagination: () => getRequest("/v1/activities/all"),
  getById: (id: string) => getRequest(`/v1/activities/${id}`),
  update: (id: string, body: any) => patchRequest(`/v1/activities/${id}`, body),
  delete: (id: string) => deleteRequest(`/v1/activities/${id}`),
};
