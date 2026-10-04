import { DesignContracts_APIS } from "@/libs/apis/design/design-contracts.api";
import { useNavigate } from "react-router-dom";
import {
  successToaster,
  errorToaster,
  confirmationPopup,
} from "@/utils/helpers/common/alert-service";
import { siteRoutes } from "@/utils/helpers/enums/routes.enum";

const useDesignContracts = () => {
  const navigate = useNavigate();

  const getContracts = async (
    setData: Function,
    queryParams: any = {},
    setTotalElements?: Function,
  ) => {
    const response = await DesignContracts_APIS.getAll(queryParams);
    const { status = false, data = [] } = response || {};
    if (status && data) {
      setData(data);
      setTotalElements?.(response?.total || data.length);
    } else {
      setData([]);
      setTotalElements?.(0);
    }
  };

  const getContractById = async (id: string, setData: Function) => {
    const response = await DesignContracts_APIS.getById(id);
    const { status = false, data = null } = response || {};
    if (status && data) {
      setData(data);
    }
  };

  const createContract = async (body: any) => {
    const response = await DesignContracts_APIS.create(body);
    const { status = false, message = "" } = response || {};
    if (status) {
      successToaster(message || "Contract created successfully");
      navigate(siteRoutes.designContracts);
      return response;
    }
  };

  const updateContract = async (id: string, body: any) => {
    const response = await DesignContracts_APIS.update(id, body);
    const { status = false, message = "" } = response || {};
    if (status) {
      successToaster(message || "Contract updated successfully");
      navigate(siteRoutes.designContracts);
      return response;
    }
  };

  const deleteContract = async (id: string, callback?: Function) => {
    const result = await confirmationPopup(
      `Delete Contract`,
      "Are you sure you want to delete this contract? This action cannot be undone.",
    );
    if (result.isConfirmed) {
      const response = await DesignContracts_APIS.delete(id);
      const { status = false, message = "" } = response || {};
      if (status) {
        successToaster(message);
        callback?.();
      } else {
        errorToaster(message);
      }
    }
  };

  const uploadContractImage = async (file: File) => {
    const formData = new FormData();
    formData.append("files", file);

    const response = await DesignContracts_APIS.uploadImage(formData);
    const data = response?.data || response || [];
    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    }
    if (!response?.error) {
      errorToaster("Failed to upload image");
    }
    return null;
  };

  return {
    getContracts,
    getContractById,
    createContract,
    updateContract,
    deleteContract,
    uploadContractImage,
  };
};

export default useDesignContracts;
