import { Activities_APIS } from "@/libs/apis/activities.api";
import { Jobs_APIS } from "@/libs/apis/jobs.api";
import { WorkStages_APIS } from "@/libs/apis/work-stages.api";
import { Units_APIS } from "@/libs/apis/units.api";
import { useNavigate } from "react-router-dom";
import {
  successToaster,
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

  const getJobs = async (setData: Function) => {
    const response = await Jobs_APIS.getAll();
    const { status = false, data = [] } = response || {};
    if (status && data) {
      setData(data);
    } else {
      setData([]);
    }
  };

  const createJob = async (name: string) => {
    const response = await Jobs_APIS.create({ name: name.trim() });
    const { status = false, message = "", data } = response || {};
    if (status) {
      successToaster(message || "Job created successfully");
      return data;
    }
    return null;
  };

  const updateJob = async (id: string, name: string) => {
    const response = await Jobs_APIS.update(id, { name: name.trim() });
    const { status = false, message = "", data } = response || {};
    if (status) {
      successToaster(message || "Job updated successfully");
      return data;
    }
    return null;
  };

  const deleteJob = async (id: string, name: string) => {
    const result = await confirmationPopup(
      `Delete ${name}`,
      "Are you sure you want to delete this job?",
    );
    if (!result.isConfirmed) return false;
    const response = await Jobs_APIS.delete(id);
    const { status = false, message = "" } = response || {};
    if (status) {
      successToaster(message || "Job deleted successfully");
      return true;
    }
    return false;
  };

  const getWorkStages = async (setData: Function) => {
    const response = await WorkStages_APIS.getAll();
    const { status = false, data = [] } = response || {};
    if (status && data) {
      setData(data);
    } else {
      setData([]);
    }
  };

  const createWorkStage = async (name: string) => {
    const response = await WorkStages_APIS.create({ name: name.trim() });
    const { status = false, message = "", data } = response || {};
    if (status) {
      successToaster(message || "Work stage created successfully");
      return data;
    }
    return null;
  };

  const updateWorkStage = async (id: string, name: string) => {
    const response = await WorkStages_APIS.update(id, { name: name.trim() });
    const { status = false, message = "", data } = response || {};
    if (status) {
      successToaster(message || "Work stage updated successfully");
      return data;
    }
    return null;
  };

  const deleteWorkStage = async (id: string, name: string) => {
    const result = await confirmationPopup(
      `Delete ${name}`,
      "Are you sure you want to delete this work stage?",
    );
    if (!result.isConfirmed) return false;
    const response = await WorkStages_APIS.delete(id);
    const { status = false, message = "" } = response || {};
    if (status) {
      successToaster(message || "Work stage deleted successfully");
      return true;
    }
    return false;
  };

  const getUnits = async (setData: Function) => {
    const response = await Units_APIS.getAll();
    const { status = false, data = [] } = response || {};
    if (status && data) {
      setData(data);
    } else {
      setData([]);
    }
  };

  const createUnit = async (name: string) => {
    const response = await Units_APIS.create({ name: name.trim() });
    const { status = false, message = "", data } = response || {};
    if (status) {
      successToaster(message || "Unit created successfully");
      return data;
    }
    return null;
  };

  const updateUnit = async (id: string, name: string) => {
    const response = await Units_APIS.update(id, { name: name.trim() });
    const { status = false, message = "", data } = response || {};
    if (status) {
      successToaster(message || "Unit updated successfully");
      return data;
    }
    return null;
  };

  const deleteUnit = async (id: string, name: string) => {
    const result = await confirmationPopup(
      `Delete ${name}`,
      "Are you sure you want to delete this unit?",
    );
    if (!result.isConfirmed) return false;
    const response = await Units_APIS.delete(id);
    const { status = false, message = "" } = response || {};
    if (status) {
      successToaster(message || "Unit deleted successfully");
      return true;
    }
    return false;
  };

  const createActivity = async (body: {
    name: string;
    category?: string;
    workStage: string;
  }) => {
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

  const updateActivity = async (
    id: string,
    body: { name: string; category?: string; workStage: string },
  ) => {
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
    getJobs,
    createJob,
    updateJob,
    deleteJob,
    getWorkStages,
    createWorkStage,
    updateWorkStage,
    deleteWorkStage,
    getUnits,
    createUnit,
    updateUnit,
    deleteUnit,
    createActivity,
    createActivitiesBulk,
    uploadActivitiesCsv,
    updateActivity,
    deleteActivity,
    downloadSampleExcel,
  };
};

export default useActivities;
