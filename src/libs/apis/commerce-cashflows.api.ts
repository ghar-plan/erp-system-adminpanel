import {
  getRequest,
  postRequest,
} from "../../utils/helpers/common/http-methods";

export const CommerceCashflows_APIS = {
  createIn: (body: any) => postRequest("/v1/commerce-cashflows/in", body),
  createOut: (body: any) => postRequest("/v1/commerce-cashflows/out", body),
  getAllCombined: (params: any = {}) =>
    getRequest("/v1/commerce-cashflows", params),
  getAllIn: (params: any = {}) =>
    getRequest("/v1/commerce-cashflows/in", params),
  getAllOut: (params: any = {}) =>
    getRequest("/v1/commerce-cashflows/out", params),
  getOutstandingSales: () =>
    getRequest("/v1/commerce-cashflows/outstanding-sales"),
  getOutstandingPurchases: () =>
    getRequest("/v1/commerce-cashflows/outstanding-purchases"),
  getInById: (id: string) => getRequest(`/v1/commerce-cashflows/in/${id}`),
  getOutById: (id: string) => getRequest(`/v1/commerce-cashflows/out/${id}`),
  getOutByPurchase: (purchaseId: string) =>
    getRequest(`/v1/commerce-cashflows/out/by-purchase/${purchaseId}`),
  getInBySale: (saleId: string) =>
    getRequest(`/v1/commerce-cashflows/in/by-sale/${saleId}`),
  uploadReceipt: (formData: FormData) =>
    postRequest("/v1/media/upload", formData),
};
