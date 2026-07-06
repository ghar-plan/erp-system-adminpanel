import { Activities_APIS } from "@/libs/apis/activities.api";
import { useNavigate } from "react-router-dom";
import {
  successToaster,
  errorToaster,
  confirmationPopup,
} from "@/utils/helpers/common/alert-service";

const useActivities = () => {
  const navigate = useNavigate();

  const getActivities = async (
    setData: Function,
    queryParams: any = {},
    setTotalElements?: Function,
  ) => {
    const response = await Activities_APIS.getAll(queryParams);
    const { status = false, data = [] } = response || {};
    if (status && data) {
      setData(data);
      setTotalElements?.(response?.total || data.length);
    } else {
      setData([]);
      setTotalElements?.(0);
    }
  };

  const getActivityById = async (id: string, setData: Function) => {
    const response = await Activities_APIS.getById(id);
    const { status = false, data = null } = response || {};
    if (status && data) {
      setData(data);
    }
  };

  const createActivity = async (body: { name: string }) => {
    const response = await Activities_APIS.create(body);
    const { status = false, message = "" } = response || {};
    if (status) {
      successToaster(message);
      navigate("/activity");
      return response;
    }
  };

  const createActivitiesBulk = async (names: string[]) => {
    const response = await Activities_APIS.createBulk({ names });
    const { status = false, message = "" } = response || {};
    if (status) {
      successToaster(message);
      navigate("/activity");
      return response;
    }
  };

  const uploadActivitiesCsv = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await Activities_APIS.uploadCsv(formData);
    const { status = false, message = "" } = response || {};
    if (status) {
      successToaster(message);
      navigate("/activity");
      return response;
    }
  };

  const updateActivity = async (id: string, body: { name: string }) => {
    const response = await Activities_APIS.update(id, body);
    const { status = false, message = "" } = response || {};
    if (status) {
      successToaster(message || "Activity updated successfully");
      navigate("/activity");
      return response;
    }
  };

  const deleteActivity = async (
    id: string,
    name: string,
    callback?: Function,
  ) => {
    const result = await confirmationPopup(
      `Delete ${name}`,
      "Are you sure you want to delete this activity? This action cannot be undone.",
    );
    if (result.isConfirmed) {
      const response = await Activities_APIS.delete(id);
      const { status = false, message = "" } = response || {};
      if (status) {
        successToaster(message);
        callback?.();
      } else {
        successToaster(message);
      }
    }
  };

  return {
    getActivities,
    getActivityById,
    createActivity,
    createActivitiesBulk,
    uploadActivitiesCsv,
    updateActivity,
    deleteActivity,
  };
};

export default useActivities;
