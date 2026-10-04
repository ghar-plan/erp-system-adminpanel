import {
  getRequest,
  postRequest,
  patchRequest,
  deleteRequest,
} from "../../../utils/helpers/common/http-methods";

export const DesignCashflows_APIS = {
  createIn: (body: any) => postRequest("/v1/design/cashflows/in", body),
  createOut: (body: any) => postRequest("/v1/design/cashflows/out", body),
  updateIn: (id: string, body: any) => patchRequest(`/v1/design/cashflows/in/${id}`, body),
  updateOut: (id: string, body: any) => patchRequest(`/v1/design/cashflows/out/${id}`, body),
  getAllIn: (params: any = {}) => getRequest("/v1/design/cashflows/in", params),
  getAllOut: (params: any = {}) => getRequest("/v1/design/cashflows/out", params),
  getAllCombined: (params: any = {}) => getRequest("/v1/design/cashflows", params),
  suggestEnteredBy: (search: string) =>
    getRequest("/v1/design/cashflows/entered-by", { search }),
  getInById: (id: string) => getRequest(`/v1/design/cashflows/in/${id}`),
  getOutById: (id: string) => getRequest(`/v1/design/cashflows/out/${id}`),
  getProjectListSummary: () => getRequest("/v1/design/cashflows/project-list"),
  getProjectTransactionReport: (params: any = {}) =>
    getRequest("/v1/design/cashflows/project-transaction-report", params),
  recordInstallment: (id: string, body: any) =>
    postRequest(`/v1/design/cashflows/out/${id}/installments`, body),
  getInstallments: (id: string) =>
    getRequest(`/v1/design/cashflows/out/${id}/installments`),
  downloadReceipt: (id: string, type: "in" | "out" = "out") =>
    `/v1/design/cashflows/${type}/${id}/receipt`,
  exportPdf: () => `/v1/design/cashflows/export/pdf`,
  deleteIn: (id: string) => deleteRequest(`/v1/design/cashflows/in/${id}`),
  deleteOut: (id: string) => deleteRequest(`/v1/design/cashflows/out/${id}`),
  uploadReceipt: (formData: FormData) =>
    postRequest("/v1/media/upload", formData),
};
