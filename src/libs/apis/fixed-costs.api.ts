import {
  getRequest,
  postRequest,
  patchRequest,
  deleteRequest,
} from "../../utils/helpers/common/http-methods";

export const FixedCosts_APIS = {
  create: (body: any) => postRequest("/v1/fixed-costs", body),
  getAll: (params: any = {}) => getRequest("/v1/fixed-costs", params),
  getById: (id: string) => getRequest(`/v1/fixed-costs/${id}`),
  update: (id: string, body: any) => patchRequest(`/v1/fixed-costs/${id}`, body),
  delete: (id: string) => deleteRequest(`/v1/fixed-costs/${id}`),
  uploadImage: (formData: FormData) => postRequest("/v1/media/upload", formData),
};
