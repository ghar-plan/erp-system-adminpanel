import { Contracts_APIS } from "@/libs/apis/contracts.api";
import { useNavigate } from "react-router-dom";
import {
  successToaster,
  errorToaster,
  confirmationPopup,
} from "@/utils/helpers/common/alert-service";

const useContracts = () => {
  const navigate = useNavigate();

  const getContracts = async (
    setData: Function,
    queryParams: any = {},
    setTotalElements?: Function,
  ) => {
    const response = await Contracts_APIS.getAll(queryParams);
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
    const response = await Contracts_APIS.getById(id);
    const { status = false, data = null } = response || {};
    if (status && data) {
      setData(data);
    }
  };

  const createContract = async (body: any) => {
    const response = await Contracts_APIS.create(body);
    const { status = false, message = "" } = response || {};
    if (status) {
      successToaster(message || "Contract created successfully");
      navigate("/contracts");
      return response;
    }
  };

  const updateContract = async (id: string, body: any) => {
    const response = await Contracts_APIS.update(id, body);
    const { status = false, message = "" } = response || {};
    if (status) {
      successToaster(message || "Contract updated successfully");
      navigate("/contracts");
      return response;
    }
  };

  const deleteContract = async (
    id: string,
    callback?: Function,
  ) => {
    const result = await confirmationPopup(
      `Delete Contract`,
      "Are you sure you want to delete this contract? This action cannot be undone.",
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

  return {
    getContracts,
    getContractById,
    createContract,
    updateContract,
    deleteContract,
  };
};

export default useContracts;
