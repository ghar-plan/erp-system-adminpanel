import {
  getRequest,
  postRequest,
  patchRequest,
  deleteRequest,
} from "../../utils/helpers/common/http-methods";

export const Contracts_APIS = {
  create: (body: any) => postRequest("/v1/contracts", body),
  getAll: (params: any = {}) => getRequest("/v1/contracts", params),
  getAllWithoutPagination: (params: any = {}) =>
    getRequest("/v1/contracts/all", params),
  getById: (id: string) => getRequest(`/v1/contracts/${id}`),
  update: (id: string, body: any) => patchRequest(`/v1/contracts/${id}`, body),
  delete: (id: string) => deleteRequest(`/v1/contracts/${id}`),
  uploadPdf: (formData: FormData) => postRequest("/v1/media/upload", formData),
  uploadImage: (formData: FormData) => postRequest("/v1/media/upload", formData),
};
