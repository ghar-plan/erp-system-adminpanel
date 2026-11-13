import { Documents_APIS } from "@/libs/apis/documents.api";
import { Gharplans_APIS } from "@/libs/apis/gharplans.api";
import {
  successToaster,
  confirmationPopup,
  errorToaster,
} from "@/utils/helpers/common/alert-service";

const useDocuments = () => {
  const getDocuments = async (
    setData: Function,
    params: any = {},
    setTotalElements?: Function,
  ) => {
    const response = await Documents_APIS.getAll(params);
    const { status = false, data = [] } = response || {};
    if (status && data) {
      setData(data);
      setTotalElements?.(response?.total ?? data.length);
    } else {
      setData([]);
      setTotalElements?.(0);
    }
  };

  const getDocumentCount = async (params: any = {}) => {
    const response = await Documents_APIS.getAll({
      ...params,
      limit: 1,
      offset: 0,
    });
    const { status = false, total = 0 } = response || {};
    return status ? Number(total) || 0 : 0;
  };

  const getDocumentById = async (id: string, setData: Function) => {
    const response = await Documents_APIS.getById(id);
    const { status = false, data = null } = response || {};
    if (status && data) {
      setData(data);
    }
  };

  const createDocument = async (body: any) => {
    const response = await Documents_APIS.create(body);
    const { status = false, message = "", data } = response || {};
    if (status) {
      successToaster(message || "Document created successfully");
      return data;
    }
    return null;
  };

  const deleteDocument = async (
    id: string,
    label: string,
    callback?: () => void,
  ) => {
    const result = await confirmationPopup(
      `Delete ${label}`,
      "Are you sure you want to delete this document?",
    );
    if (result.isConfirmed) {
      const response = await Documents_APIS.delete(id);
      const { status = false, message = "" } = response || {};
      if (status) {
        successToaster(message);
        callback?.();
      }
    }
  };

  const downloadPdf = async (id: string, filename?: string) => {
    try {
      await Documents_APIS.downloadPdf(id, filename);
    } catch {
      errorToaster("Failed to download PDF");
    }
  };

  const getProducts = async (
    setData: Function,
    params: any = {},
    setTotalElements?: Function,
  ) => {
    const response = await Gharplans_APIS.getProducts(params);
    const { status = false, data = [] } = response || {};
    if (status && data) {
      setData(data);
      setTotalElements?.(response?.total ?? data.length);
    } else {
      setData([]);
      setTotalElements?.(0);
    }
  };

  return {
    getDocuments,
    getDocumentCount,
    getDocumentById,
    createDocument,
    deleteDocument,
    downloadPdf,
    getProducts,
  };
};

export default useDocuments;
