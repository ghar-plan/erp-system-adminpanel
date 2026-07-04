import {
  getRequest,
  postRequest,
} from "../../utils/helpers/common/http-methods";

export const Activities_APIS = {
  create: (body: any) => postRequest("/v1/activities", body),
  createBulk: (body: any) => postRequest("/v1/activities/bulk", body),
  uploadCsv: (formData: FormData) => postRequest("/v1/activities/upload", formData),
  getAll: (params: any = {}) => getRequest("/v1/activities", params),
  getById: (id: string) => getRequest(`/v1/activities/${id}`),
};
