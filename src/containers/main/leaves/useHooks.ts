import { Leaves_APIS } from "@/libs/apis/leaves.api";
import {
  confirmationPopup,
  errorToaster,
  successToaster,
} from "@/utils/helpers/common/alert-service";

const useLeaves = () => {
  const applyLeave = async (body: {
    startDate: string;
    endDate: string;
    reason: string;
  }) => {
    const response = await Leaves_APIS.create(body);
    if (response?.status) {
      successToaster(response.message || "Leave request submitted");
      return response.data;
    }
    if (!response?.toasted) {
      errorToaster(response?.message || "Failed to submit leave request");
    }
    return null;
  };

  const getMyLeaves = async (
    setData: Function,
    queryParams: any = {},
    setTotalElements?: Function,
  ) => {
    const response = await Leaves_APIS.getMine(queryParams);
    if (response?.status && response.data) {
      setData(response.data);
      setTotalElements?.(response.total || response.data.length);
    } else {
      setData([]);
      setTotalElements?.(0);
    }
  };

  const getAllLeaves = async (
    setData: Function,
    queryParams: any = {},
    setTotalElements?: Function,
  ) => {
    const response = await Leaves_APIS.getAll(queryParams);
    if (response?.status && response.data) {
      setData(response.data);
      setTotalElements?.(response.total || response.data.length);
    } else {
      setData([]);
      setTotalElements?.(0);
    }
  };

  const approveLeave = async (id: string, note?: string) => {
    const response = await Leaves_APIS.approve(id, note);
    if (response?.status) {
      successToaster(response.message || "Leave request approved");
      return true;
    }
    if (!response?.toasted) {
      errorToaster(response?.message || "Failed to approve leave");
    }
    return false;
  };

  const rejectLeave = async (id: string, note?: string) => {
    const response = await Leaves_APIS.reject(id, note);
    if (response?.status) {
      successToaster(response.message || "Leave request rejected");
      return true;
    }
    if (!response?.toasted) {
      errorToaster(response?.message || "Failed to reject leave");
    }
    return false;
  };

  const cancelLeave = async (id: string) => {
    const result = await confirmationPopup(
      "Cancel leave request",
      "This pending leave request will be cancelled.",
    );
    if (!result.isConfirmed) return false;
    const response = await Leaves_APIS.cancel(id);
    if (response?.status) {
      successToaster(response.message || "Leave request cancelled");
      return true;
    }
    if (!response?.toasted) {
      errorToaster(response?.message || "Failed to cancel leave");
    }
    return false;
  };

  const deleteLeave = async (id: string, callback?: Function) => {
    const result = await confirmationPopup(
      "Delete leave request",
      "This leave request will be removed.",
    );
    if (!result.isConfirmed) return false;
    const response = await Leaves_APIS.delete(id);
    if (response?.status) {
      successToaster(response.message || "Leave request deleted");
      callback?.();
      return true;
    }
    if (!response?.toasted) {
      errorToaster(response?.message || "Failed to delete leave");
    }
    return false;
  };

  return {
    applyLeave,
    getMyLeaves,
    getAllLeaves,
    approveLeave,
    rejectLeave,
    cancelLeave,
    deleteLeave,
  };
};

export default useLeaves;
