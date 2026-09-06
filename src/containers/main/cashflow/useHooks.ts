import { Cashflows_APIS } from "@/libs/apis/cashflows.api";
import { Projects_APIS } from "@/libs/apis/projects.api";
import { Vendors_APIS } from "@/libs/apis/vendors.api";
import { Activities_APIS } from "@/libs/apis/activities.api";
import {
  successToaster,
  errorToaster,
  confirmationPopup,
} from "@/utils/helpers/common/alert-service";
import axios from "@/utils/helpers/common/axios.config";
import { store } from "@/store";

const useCashflow = () => {
  const getProjects = async (setData: Function) => {
    const response = await Projects_APIS.getAllWithoutPagination();
    const { status = false, data = [] } = response || {};
    if (status && data) {
      setData(data);
    } else {
      setData([]);
    }
  };

  const getVendors = async (setData: Function) => {
    const response = await Vendors_APIS.getAllWithoutPagination();
    const { status = false, data = [] } = response || {};
    if (status && data) {
      setData(data);
    } else {
      setData([]);
    }
  };

  const getActivities = async (setData: Function) => {
    const response = await Activities_APIS.getAllWithoutPagination();
    const { status = false, data = [] } = response || {};
    if (status && data) {
      setData(data);
    } else {
      setData([]);
    }
  };

  const getCashflowInList = async (setData: Function, queryParams: any = {}) => {
    const response = await Cashflows_APIS.getAllIn(queryParams);
    const { status = false, data = [] } = response || {};
    if (status && data) {
      setData(data);
    } else {
      setData([]);
    }
  };

  const getCashflowOutList = async (setData: Function, queryParams: any = {}) => {
    const response = await Cashflows_APIS.getAllOut(queryParams);
    const { status = false, data = [] } = response || {};
    if (status && data) {
      setData(data);
    } else {
      setData([]);
    }
  };

  const suggestEnteredBy = async (search: string): Promise<string[]> => {
    const response = await Cashflows_APIS.suggestEnteredBy(search);
    const { status = false, data = [] } = response || {};
    return status && Array.isArray(data) ? data : [];
  };

  const getCashflowCombinedList = async (
    setData: Function,
    queryParams: any = {},
    setTotalElements?: Function,
    setTotals?: Function,
  ) => {
    const response = await Cashflows_APIS.getAllCombined(queryParams);
    const { status = false, data } = response || {};
    if (status && data) {
      // In ApiResponseDto.success mapping, data is now an object: { data: [], total: number, totalIn: number, totalOut: number }
      const items = Array.isArray(data) ? data : data.data || [];
      setData(items);
      setTotalElements?.(response?.total || data.total || items.length);
      setTotals?.({ totalIn: data.totalIn || 0, totalOut: data.totalOut || 0 });
    } else {
      setData([]);
      setTotalElements?.(0);
      setTotals?.({ totalIn: 0, totalOut: 0 });
    }
  };

  const getCashInById = async (id: string, setData: Function) => {
    const response = await Cashflows_APIS.getInById(id);
    const { status = false, data = null } = response || {};
    if (status && data) {
      setData(data);
    } else {
      setData(null);
    }
  };

  const getCashOutById = async (id: string, setData: Function) => {
    const response = await Cashflows_APIS.getOutById(id);
    const { status = false, data = null } = response || {};
    if (status && data) {
      setData(data);
    } else {
      setData(null);
    }
  };

  const recordCashIn = async (body: any, callback?: Function) => {
    const response = await Cashflows_APIS.createIn(body);
    const { status = false, message = "" } = response || {};
    if (status) {
      successToaster(message);
      callback?.();
      return response;
    }
  };

  const recordCashOut = async (body: any, callback?: Function) => {
    const response = await Cashflows_APIS.createOut(body);
    const { status = false, message = "" } = response || {};
    if (status) {
      successToaster(message);
      callback?.();
      return response;
    }
  };

  const editCashIn = async (id: string, body: any, callback?: Function) => {
    const response = await Cashflows_APIS.updateIn(id, body);
    const { status = false, message = "" } = response || {};
    if (status) {
      successToaster(message);
      callback?.();
      return response;
    }
  };

  const editCashOut = async (id: string, body: any, callback?: Function) => {
    const response = await Cashflows_APIS.updateOut(id, body);
    const { status = false, message = "" } = response || {};
    if (status) {
      successToaster(message);
      callback?.();
      return response;
    }
  };

  const deleteCashflow = async (
    id: string,
    type: "CASH IN" | "CASH OUT",
    label: string,
    callback?: Function,
  ) => {
    const result = await confirmationPopup(
      `Delete ${type}`,
      `Are you sure you want to delete "${label}"? This action cannot be undone.`,
    );
    if (result.isConfirmed) {
      const response =
        type === "CASH IN"
          ? await Cashflows_APIS.deleteIn(id)
          : await Cashflows_APIS.deleteOut(id);
      const { status = false, message = "" } = response || {};
      if (status) {
        successToaster(message);
        callback?.();
      }
    }
  };

  const exportCashflowCsv = async (params: any = {}) => {
    return await Cashflows_APIS.exportCsv(params);
  };

  const exportCashflowPdf = async (params: any = {}) => {
    try {
      const token = store.getState().sharedReducer.token;
      const response = await axios.get(Cashflows_APIS.exportPdf(), {
        params,
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const contentType = String(response.headers?.["content-type"] || "");
      if (contentType.includes("application/json")) {
        const text = await (response.data as Blob).text();
        const json = JSON.parse(text);
        const message = Array.isArray(json?.message)
          ? json.message.join(", ")
          : json?.message;
        errorToaster(message || "Please update the Payment Plan for the projects");
        return;
      }
      const url = window.URL.createObjectURL(
        new Blob([response.data], {
          type: "application/pdf",
        }),
      );
      const link = document.createElement("a");
      link.href = url;
      const dateStr = new Date().toISOString().split("T")[0].replace(/-/g, "_");
      link.setAttribute("download", `Expense_Sheet_${dateStr}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("Error downloading pdf", error);
      const data = error?.response?.data;
      if (data instanceof Blob) {
        try {
          const json = JSON.parse(await data.text());
          const message = Array.isArray(json?.message)
            ? json.message.join(", ")
            : json?.message;
          errorToaster(
            message || "Please update the Payment Plan for the projects",
          );
          return;
        } catch {
          /* fall through */
        }
      }
      errorToaster(
        error?.response?.data?.message || "Failed to download PDF report",
      );
    }
  };

  const uploadReceipt = async (file: File) => {
    const formData = new FormData();
    formData.append("files", file);

    const response = await Cashflows_APIS.uploadReceipt(formData);
    const data = response?.data || response || [];
    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    }
    if (!response?.error) {
      errorToaster("Failed to upload receipt");
    }
    return null;
  };

  const downloadReceipt = async (id: string, type: "CASH IN" | "CASH OUT") => {
    try {
      const receiptType = type === "CASH IN" ? "in" : "out";
      const token = store.getState().sharedReducer.token;
      const response = await axios.get(
        Cashflows_APIS.downloadReceipt(id, receiptType),
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        },
      );
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `receipt-${receiptType}-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading receipt", error);
      errorToaster("Failed to download receipt");
    }
  };

  return {
    getProjects,
    getVendors,
    getActivities,
    getCashflowInList,
    getCashflowOutList,
    suggestEnteredBy,
    getCashflowCombinedList,
    getCashInById,
    getCashOutById,
    recordCashIn,
    recordCashOut,
    editCashIn,
    editCashOut,
    deleteCashflow,
    exportCashflowCsv,
    exportCashflowPdf,
    uploadReceipt,
    downloadReceipt,
  };
};

export default useCashflow;
