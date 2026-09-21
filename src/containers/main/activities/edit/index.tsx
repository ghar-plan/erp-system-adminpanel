import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import useStore from "@/hooks/useStore";
import useActivities from "../useHooks";
import { IoArrowBackOutline } from "react-icons/io5";
import { WORK_STAGE_OPTIONS } from "@/utils/helpers/models/activities/activity.dto";

interface ActivityFormInputs {
  name: string;
  category: string;
  workStage: string;
}

export default function ActivityEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getActivityById, updateActivity, getJobs } = useActivities();
  const { isLoading } = useStore();
  const [initialData, setInitialData] = useState<any>(null);
  const [jobs, setJobs] = useState<{ id: string; name: string }[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ActivityFormInputs>();

  useEffect(() => {
    getJobs(setJobs);
    if (id) {
      getActivityById(id, (data: any) => {
        setInitialData(data);
        setValue("name", data.name);
        setValue("category", data.category || "");
        setValue("workStage", data.workStage || "");
      });
    }
  }, [id]);

  const onSubmitForm = async (data: ActivityFormInputs) => {
    if (!id) return;
    await updateActivity(id, {
      name: data.name.trim(),
      category: data.category || undefined,
      workStage: data.workStage,
    });
  };

  const goToBack = () => {
    navigate(-1);
  };

  const jobOptions =
    initialData?.category &&
    !jobs.some((job) => job.name === initialData.category)
      ? [{ id: "legacy", name: initialData.category }, ...jobs]
      : jobs;

  if (!initialData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={goToBack}
            className="w-10 h-10 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-all duration-200 cursor-pointer"
            title="Go Back"
          >
            <IoArrowBackOutline size={20} className="stroke-[2.5]" />
          </button>
          <h1 className="text-2xl text-foreground font-bold">
            Edit Activity
          </h1>
        </div>
      </div>

      {/* Form Container */}
      <form
        id="activity-edit-form"
        onSubmit={handleSubmit(onSubmitForm)}
        className="mt-8 w-full animate-slide-up space-y-6"
      >
        <hr className="border-border-main" />

        {/* Input Fields */}
        <div className="space-y-5">
          <div className="grid gap-5 grid-cols-1 md:grid-cols-2">
            <div>
              <label className="mb-2 block ui-form-label">Comments</label>
              <input
                type="text"
                placeholder="e.g. Masonry Work"
                className={`common-input py-3 ${errors.name ? "border-red-500 focus:border-red-500" : ""}`}
                {...register("name", { required: "Comments is required" })}
              />
              {errors.name && (
                <p className="mt-1.5 text-xs text-red-500 font-semibold">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block ui-form-label">Job</label>
              <select
                className={`common-input py-3 ${errors.category ? "border-red-500 focus:border-red-500" : ""}`}
                {...register("category", { required: "Job is required" })}
              >
                <option value="">Select Job</option>
                {jobOptions.map((job) => (
                  <option key={job.id} value={job.name}>
                    {job.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1.5 text-xs text-red-500 font-semibold">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block ui-form-label">
                Work Stages <span className="text-red-500">*</span>
              </label>
              <select
                className={`common-input py-3 ${errors.workStage ? "border-red-500 focus:border-red-500" : ""}`}
                {...register("workStage", {
                  required: "Work Stages is required",
                })}
              >
                <option value="" disabled>
                  Select Work Stage
                </option>
                {WORK_STAGE_OPTIONS.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
              {errors.workStage && (
                <p className="mt-1.5 text-xs text-red-500 font-semibold">
                  {errors.workStage.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Button inside the form card */}
        <div className="flex justify-end pt-4 border-t border-border-main/60">
          <button
            type="submit"
            disabled={isLoading}
            className="flex h-10 px-6 items-center justify-center gap-2 rounded-md bg-primary hover:opacity-95 font-semibold text-white text-sm transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed animate-fade-in"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
