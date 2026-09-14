import {
  deleteRequest,
  getRequest,
  getRequestSilent,
  patchRequest,
  postRequest,
} from "../../utils/helpers/common/http-methods";

export const Comments_APIS = {
  getAll: (params: { projectId: string; offset?: number; limit?: number }) =>
    getRequest("/v1/comments", params),
  getAllSilent: (params: { projectId: string; offset?: number; limit?: number }) =>
    getRequestSilent("/v1/comments", params),
  create: (body: { projectId: string; message: string }) =>
    postRequest("/v1/comments", body),
  update: (id: string, body: { message: string }) =>
    patchRequest(`/v1/comments/${id}`, body),
  delete: (id: string) => deleteRequest(`/v1/comments/${id}`),
};
