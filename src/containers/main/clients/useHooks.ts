import { Clients_APIS } from "@/libs/apis/clients.api";
import {
  confirmationPopup,
  errorToaster,
  successToaster,
} from "@/utils/helpers/common/alert-service";

const useClients = () => {
  const getClients = async (
    setData: (rows: any[]) => void,
    queryParams: Record<string, unknown> = {},
    setTotalElements?: (total: number) => void,
  ) => {
    const response = await Clients_APIS.getAll(queryParams);
    if (response?.status && response.data) {
      setData(response.data);
      setTotalElements?.(response.total || response.data.length);
      return;
    }
    setData([]);
    setTotalElements?.(0);
  };

  const getClientById = async (id: string, setData: (row: any | null) => void) => {
    const response = await Clients_APIS.getById(id);
    if (response?.status && response.data) {
      setData(response.data);
      return;
    }
    setData(null);
  };

  const deleteClient = async (id: string, name: string, callback?: () => void) => {
    const result = await confirmationPopup(
      `Delete ${name}`,
      "This client account will be removed and will no longer be able to sign in.",
    );
    if (!result.isConfirmed) return false;
    const response = await Clients_APIS.delete(id);
    if (response?.status) {
      successToaster(response.message || "Client deleted successfully");
      callback?.();
      return true;
    }
    if (!response?.toasted) {
      errorToaster(response?.message || "Failed to delete client");
    }
    return false;
  };

  return { getClients, getClientById, deleteClient };
};

export default useClients;
