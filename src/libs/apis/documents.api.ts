import {
  getRequest,
  postRequest,
  deleteRequest,
} from "../../utils/helpers/common/http-methods";
import axios from "../../utils/helpers/common/axios.config";
import { store } from "@/store";

export const Documents_APIS = {
  create: (body: any) => postRequest("/v1/documents", body),
  getAll: (params: any = {}) => getRequest("/v1/documents", params),
  getById: (id: string) => getRequest(`/v1/documents/${id}`),
  delete: (id: string) => deleteRequest(`/v1/documents/${id}`),
  pdfUrl: (id: string) => `/v1/documents/${id}/pdf`,
  downloadPdf: async (id: string, filename?: string) => {
    const token = store.getState().sharedReducer.token;
    const response = await axios.get(Documents_APIS.pdfUrl(id), {
      headers: { Authorization: `Bearer ${token}` },
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(
      new Blob([response.data], { type: "application/pdf" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename || `document-${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
