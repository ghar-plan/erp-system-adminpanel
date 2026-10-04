import {
  getRequest,
  postRequest,
  patchRequest,
  deleteRequest,
} from "../../../utils/helpers/common/http-methods";

export const DesignContracts_APIS = {
  create: (body: any) => postRequest("/v1/design/contracts", body),
  getAll: (params: any = {}) => getRequest("/v1/design/contracts", params),
  getAllWithoutPagination: (params: any = {}) =>
    getRequest("/v1/design/contracts/all", params),
  getById: (id: string) => getRequest(`/v1/design/contracts/${id}`),
  update: (id: string, body: any) => patchRequest(`/v1/design/contracts/${id}`, body),
  delete: (id: string) => deleteRequest(`/v1/design/contracts/${id}`),
  uploadPdf: (formData: FormData) => postRequest("/v1/media/upload", formData),
  uploadImage: (formData: FormData) => postRequest("/v1/media/upload", formData),
};
