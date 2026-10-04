import { DesignJobs_APIS } from "@/libs/apis/design/design-jobs.api";
import { DesignWorkStages_APIS } from "@/libs/apis/design/design-work-stages.api";
import {
  successToaster,
  confirmationPopup,
} from "@/utils/helpers/common/alert-service";

const useDesignActivities = () => {
  const getJobs = async (setData: Function) => {
    const response = await DesignJobs_APIS.getAll();
    const { status = false, data = [] } = response || {};
    if (status && data) {
      setData(data);
    } else {
      setData([]);
    }
  };

  const createJob = async (name: string) => {
    const response = await DesignJobs_APIS.create({ name: name.trim() });
    const { status = false, message = "", data } = response || {};
    if (status) {
      successToaster(message || "Material/Service created successfully");
      return data;
    }
    return null;
  };

  const updateJob = async (id: string, name: string) => {
    const response = await DesignJobs_APIS.update(id, { name: name.trim() });
    const { status = false, message = "", data } = response || {};
    if (status) {
      successToaster(message || "Material/Service updated successfully");
      return data;
    }
    return null;
  };

  const deleteJob = async (id: string, name: string) => {
    const result = await confirmationPopup(
      `Delete ${name}`,
      "Are you sure you want to delete this material/service?",
    );
    if (!result.isConfirmed) return false;
    const response = await DesignJobs_APIS.delete(id);
    const { status = false, message = "" } = response || {};
    if (status) {
      successToaster(message || "Material/Service deleted successfully");
      return true;
    }
    return false;
  };

  const getWorkStages = async (setData: Function) => {
    const response = await DesignWorkStages_APIS.getAll();
    const { status = false, data = [] } = response || {};
    if (status && data) {
      setData(data);
    } else {
      setData([]);
    }
  };

  const createWorkStage = async (name: string) => {
    const response = await DesignWorkStages_APIS.create({ name: name.trim() });
    const { status = false, message = "", data } = response || {};
    if (status) {
      successToaster(message || "Work stage created successfully");
      return data;
    }
    return null;
  };

  const updateWorkStage = async (id: string, name: string) => {
    const response = await DesignWorkStages_APIS.update(id, { name: name.trim() });
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
    const response = await DesignWorkStages_APIS.delete(id);
    const { status = false, message = "" } = response || {};
    if (status) {
      successToaster(message || "Work stage deleted successfully");
      return true;
    }
    return false;
  };

  return {
    getJobs,
    createJob,
    updateJob,
    deleteJob,
    getWorkStages,
    createWorkStage,
    updateWorkStage,
    deleteWorkStage,
  };
};

export default useDesignActivities;
