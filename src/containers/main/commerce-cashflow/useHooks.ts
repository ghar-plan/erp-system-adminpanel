import { CommerceCashflows_APIS } from "@/libs/apis/commerce-cashflows.api";
import {
  successToaster,
  errorToaster,
} from "@/utils/helpers/common/alert-service";
const useCommerceCashflow = () => {
  const getCombinedList = async (setData: Function) => {
    const response = await CommerceCashflows_APIS.getAllCombined();
    const { status = false, data = [] } = response || {};
    if (status && data) {
      setData(Array.isArray(data) ? data : []);
    } else {
      setData([]);
    }
  };

  const getOutstandingSales = async (setData: Function) => {
    const response = await CommerceCashflows_APIS.getOutstandingSales();
    const { status = false, data = [] } = response || {};
    setData(status && Array.isArray(data) ? data : []);
  };

  const getOutstandingPurchases = async (setData: Function) => {
    const response = await CommerceCashflows_APIS.getOutstandingPurchases();
    const { status = false, data = [] } = response || {};
    setData(status && Array.isArray(data) ? data : []);
  };

  const recordCashIn = async (body: any, onSuccess?: () => void) => {
    const response = await CommerceCashflows_APIS.createIn(body);
    const { status = false, message } = response || {};
    if (status) {
      successToaster(message || "Cash in recorded successfully");
      onSuccess?.();
      return true;
    }
    errorToaster(message || "Failed to record cash in");
    return false;
  };

  const recordCashOut = async (body: any, onSuccess?: () => void) => {
    const response = await CommerceCashflows_APIS.createOut(body);
    const { status = false, message } = response || {};
    if (status) {
      successToaster(message || "Cash out recorded successfully");
      onSuccess?.();
      return true;
    }
    errorToaster(message || "Failed to record cash out");
    return false;
  };

  const uploadReceipt = async (file: File) => {
    const formData = new FormData();
    formData.append("files", file);
    const response = await CommerceCashflows_APIS.uploadReceipt(formData);
    const data = response?.data || response || [];
    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    }
    if (!response?.error) {
      errorToaster("Failed to upload receipt");
    }
    return null;
  };

  const getInById = async (id: string, setData: Function) => {
    const response = await CommerceCashflows_APIS.getInById(id);
    const { status = false, data } = response || {};
    if (status && data) setData(data);
    else setData(null);
  };

  const getOutById = async (id: string, setData: Function) => {
    const response = await CommerceCashflows_APIS.getOutById(id);
    const { status = false, data } = response || {};
    if (status && data) setData(data);
    else setData(null);
  };

  const getOutByPurchase = async (purchaseId: string, setData: Function) => {
    const response = await CommerceCashflows_APIS.getOutByPurchase(purchaseId);
    const { status = false, data = [] } = response || {};
    setData(status && Array.isArray(data) ? data : []);
  };

  const getInBySale = async (saleId: string, setData: Function) => {
    const response = await CommerceCashflows_APIS.getInBySale(saleId);
    const { status = false, data = [] } = response || {};
    setData(status && Array.isArray(data) ? data : []);
  };

  return {
    getCombinedList,
    getOutstandingSales,
    getOutstandingPurchases,
    recordCashIn,
    recordCashOut,
    uploadReceipt,
    getInById,
    getOutById,
    getOutByPurchase,
    getInBySale,
  };
};

export default useCommerceCashflow;
