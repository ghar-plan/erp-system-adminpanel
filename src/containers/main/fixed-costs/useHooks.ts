import { FixedCosts_APIS } from "@/libs/apis/fixed-costs.api";
import { useNavigate } from "react-router-dom";
import {
  successToaster,
  confirmationPopup,
  errorToaster,
} from "@/utils/helpers/common/alert-service";
import { getCategoryLabel } from "@/utils/helpers/models/fixed-costs/fixed-cost.dto";

const useFixedCosts = () => {
  const navigate = useNavigate();

  const getFixedCosts = async (
    setData: Function,
    params: any = {},
    setTotalElements?: Function,
  ) => {
    const response = await FixedCosts_APIS.getAll(params);
    const { status = false, data = [] } = response || {};
    if (status && data) {
      setData(data);
      setTotalElements?.(response?.total ?? data.length);
    } else {
      setData([]);
      setTotalElements?.(0);
    }
  };

  const getFixedCostById = async (id: string, setData: Function) => {
    const response = await FixedCosts_APIS.getById(id);
    const { status = false, data = null } = response || {};
    if (status && data) {
      setData(data);
    }
  };

  const createFixedCost = async (body: any) => {
    const response = await FixedCosts_APIS.create(body);
    const { status = false, message = "" } = response || {};
    if (status) {
      successToaster(message);
      navigate("/fixed-costs");
      return response;
    }
  };

  const updateFixedCost = async (id: string, body: any) => {
    const response = await FixedCosts_APIS.update(id, body);
    const { status = false, message = "" } = response || {};
    if (status) {
      successToaster(message);
      navigate("/fixed-costs");
      return response;
    }
  };

  const deleteFixedCost = async (
    id: string,
    category: string,
    callback?: () => void,
  ) => {
    const label = getCategoryLabel(category);
    const result = await confirmationPopup(
      `Delete fixed cost`,
      `Are you sure you want to delete this "${label}" record? This action cannot be undone.`,
    );
    if (result.isConfirmed) {
      const response = await FixedCosts_APIS.delete(id);
      const { status = false, message = "" } = response || {};
      if (status) {
        successToaster(message);
        callback?.();
      }
    }
  };

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("files", file);

    const response = await FixedCosts_APIS.uploadImage(formData);
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
    getFixedCosts,
    getFixedCostById,
    createFixedCost,
    updateFixedCost,
    deleteFixedCost,
    uploadImage,
  };
};

export default useFixedCosts;
