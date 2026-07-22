import { Activities_APIS } from "@/libs/apis/activities.api";
import { useNavigate } from "react-router-dom";
import {
  successToaster,
  errorToaster,
  confirmationPopup,
} from "@/utils/helpers/common/alert-service";
import axios from "@/utils/helpers/common/axios.config";
import { store } from "@/store";

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

  const getAllActivities = async (setData: Function) => {
    const response = await Activities_APIS.getAllWithoutPagination();
    const { status = false, data = [] } = response || {};
    if (status && data) {
      setData(data);
    } else {
      setData([]);
    }
  };

  const getActivityById = async (id: string, setData: Function) => {
    const response = await Activities_APIS.getById(id);
    const { status = false, data = null } = response || {};
    if (status && data) {
      setData(data);
    }
  };

  const createActivity = async (body: { name: string; category?: string }) => {
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

  const updateActivity = async (id: string, body: { name: string; category?: string }) => {
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

  const downloadSampleExcel = async () => {
    try {
      const state = store.getState();
      const token = state.sharedReducer.token;
      const response = await axios.get("/v1/activities/sample-download", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      });
      
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "activities_sample.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download sample file", error);
    }
  };

  return {
    getActivities,
    getAllActivities,
    getActivityById,
    createActivity,
    createActivitiesBulk,
    uploadActivitiesCsv,
    updateActivity,
    deleteActivity,
    downloadSampleExcel,
  };
};

export default useActivities;
