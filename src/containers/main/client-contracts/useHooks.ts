import { Contracts_APIS } from "@/libs/apis/contracts.api";
import { useNavigate } from "react-router-dom";
import {
  successToaster,
  errorToaster,
  confirmationPopup,
} from "@/utils/helpers/common/alert-service";
import { siteRoutes } from "@/utils/helpers/enums/routes.enum";

const useClientContracts = () => {
  const navigate = useNavigate();

  const getClientContracts = async (
    setData: Function,
    queryParams: any = {},
    setTotalElements?: Function,
  ) => {
    const response = await Contracts_APIS.getAll({
      ...queryParams,
      type: "client",
    });
    const { status = false, data = [] } = response || {};
    if (status && data) {
      setData(data);
      setTotalElements?.(response?.total || data.length);
    } else {
      setData([]);
      setTotalElements?.(0);
    }
  };

  const getClientContractById = async (id: string, setData: Function) => {
    const response = await Contracts_APIS.getById(id);
    const { status = false, data = null } = response || {};
    if (status && data) {
      setData(data);
    }
  };

  const createClientContract = async (body: any) => {
    const response = await Contracts_APIS.create({
      ...body,
      type: "client",
    });
    const { status = false, message = "" } = response || {};
    if (status) {
      successToaster(message || "Client contract created successfully");
      navigate(siteRoutes.clientContracts);
      return response;
    }
  };

  const updateClientContract = async (id: string, body: any) => {
    const response = await Contracts_APIS.update(id, body);
    const { status = false, message = "" } = response || {};
    if (status) {
      successToaster(message || "Client contract updated successfully");
      navigate(siteRoutes.clientContracts);
      return response;
    }
  };

  const deleteClientContract = async (id: string, callback?: Function) => {
    const result = await confirmationPopup(
      `Delete Client Contract`,
      "Are you sure you want to delete this client contract? This action cannot be undone.",
    );
    if (result.isConfirmed) {
      const response = await Contracts_APIS.delete(id);
      const { status = false, message = "" } = response || {};
      if (status) {
        successToaster(message);
        callback?.();
      } else {
        errorToaster(message);
      }
    }
  };

  const uploadContractPdf = async (file: File) => {
    const formData = new FormData();
    formData.append("files", file);

    const response = await Contracts_APIS.uploadPdf(formData);
    const data = response?.data || response || [];
    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    }
    if (!response?.error) {
      errorToaster("Failed to upload contract PDF");
    }
    return null;
  };

  return {
    getClientContracts,
    getClientContractById,
    createClientContract,
    updateClientContract,
    deleteClientContract,
    uploadContractPdf,
  };
};

export default useClientContracts;
