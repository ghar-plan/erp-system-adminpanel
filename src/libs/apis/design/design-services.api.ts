import {
  getRequest,
  postRequest,
  patchRequest,
  deleteRequest,
} from "../../../utils/helpers/common/http-methods";

export const DesignServices_APIS = {
  create: (body: { name: string }) => postRequest("/v1/design/services", body),
  getAll: () => getRequest("/v1/design/services"),
  update: (id: string, body: { name: string }) =>
    patchRequest(`/v1/design/services/${id}`, body),
  delete: (id: string) => deleteRequest(`/v1/design/services/${id}`),
};
