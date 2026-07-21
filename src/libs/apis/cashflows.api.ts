import {
  getRequest,
  postRequest,
  patchRequest,
  deleteRequest,
} from "../../utils/helpers/common/http-methods";

export const Cashflows_APIS = {
  createIn: (body: any) => postRequest("/v1/cashflows/in", body),
  createOut: (body: any) => postRequest("/v1/cashflows/out", body),
  updateIn: (id: string, body: any) => patchRequest(`/v1/cashflows/in/${id}`, body),
  updateOut: (id: string, body: any) => patchRequest(`/v1/cashflows/out/${id}`, body),
  getAllIn: (params: any = {}) => getRequest("/v1/cashflows/in", params),
  getAllOut: (params: any = {}) => getRequest("/v1/cashflows/out", params),
  getAllCombined: (params: any = {}) => getRequest("/v1/cashflows", params),
  getProjectListSummary: () => getRequest("/v1/cashflows/project-list"),
  downloadReceipt: (id: string, type: "in" | "out" = "out") =>
    `/v1/cashflows/${type}/${id}/receipt`,
  exportCsv: (params: any = {}) => getRequest("/v1/cashflows/export", params),
  exportExcel: () => `/v1/cashflows/export/excel`,
  deleteIn: (id: string) => deleteRequest(`/v1/cashflows/in/${id}`),
  deleteOut: (id: string) => deleteRequest(`/v1/cashflows/out/${id}`),
};
