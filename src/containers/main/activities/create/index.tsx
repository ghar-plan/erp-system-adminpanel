import React, { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import useStore from "@/hooks/useStore";
import useActivities from "../useHooks";
import { IoArrowBackOutline } from "react-icons/io5";

interface ActivityFormInputs {
  names: string;
}

export default function ActivityCreate() {
  const navigate = useNavigate();
  const { createActivity, createActivitiesBulk } = useActivities();
  const { isLoading } = useStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ActivityFormInputs>();

  const onSubmitForm = async (data: ActivityFormInputs) => {
    // Process input names: split by commas if multiple, clean whitespaces
    const rawNames = data.names.split(",").map((name) => name.trim()).filter((name) => name.length > 0);

    if (rawNames.length === 0) return;

    if (rawNames.length === 1) {
      await createActivity({ name: rawNames[0] });
    } else {
      await createActivitiesBulk(rawNames);
    }
  };

  const goToBack = () => {
    navigate(-1);
  };

  return (
    <div className="bg-background transition-colors duration-200">
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
          <h1 className="text-2xl text-foreground font-bold font-sans">
            Register New Activity
          </h1>
        </div>
      </div>

      {/* Form Container */}
      <form
        id="activity-create-form"
        onSubmit={handleSubmit(onSubmitForm)}
        className="mt-8 w-full animate-slide-up space-y-6"
      >
        <hr className="border-border-main" />

        {/* Input Fields */}
        <div className="space-y-5">
          <div>
            <label className="mb-2 block ui-form-label">Activity Name(s)</label>
            <textarea
              placeholder="e.g. Masonry Work, Painting, Plumbing (separate multiple activities with commas)"
              rows={4}
              className={`common-input py-3 resize-none ${errors.names ? "border-red-500 focus:border-red-500" : ""}`}
              {...register("names", { required: "Activity Name is required" })}
            />
            {errors.names && (
              <p className="mt-1.5 text-xs text-red-500 font-semibold">
                {errors.names.message}
              </p>
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              Tip: You can add a single activity name, or enter multiple activities separated by commas (e.g. "Excavation, Electrician Work") to register them in bulk.
            </p>
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
              <>
                <Plus size={18} />
                Add Activity
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
