import React, { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import useStore from "@/hooks/useStore";
import useDesignProjects from "../useHooks";
import { IoArrowBackOutline } from "react-icons/io5";
import {
  PAKISTAN_MOBILE_FORMAT_MESSAGE,
  validatePakistanMobile,
} from "@/utils/helpers/common/phone";
import PakistanPhoneInput from "@/components/ui/PakistanPhoneInput";

interface ProjectFormInputs {
  clientFullName: string;
  clientEmail: string;
  clientPhone: string;
  supervisorName: string;
  supervisorContactNumber: string;
  managerName: string;
  managerContactNumber: string;
  siteName: string;
  region: string;
  subregion: string;
  startDate: string;
}

export default function DesignProjectCreate() {
  const navigate = useNavigate();
  const { createProject, getManagerOptions } = useDesignProjects();
  const { isLoading } = useStore();

  const [managerOptions, setManagerOptions] = useState<
    Array<{ id: string; fullName: string; phone: string; source: string }>
  >([]);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<ProjectFormInputs>({
    defaultValues: {
      clientFullName: "",
      clientEmail: "",
      clientPhone: "",
      supervisorName: "",
      supervisorContactNumber: "",
      managerName: "",
      managerContactNumber: "",
    },
  });

  useEffect(() => {
    getManagerOptions(setManagerOptions);
  }, []);

  const handleManagerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = managerOptions.find((manager) => manager.id === e.target.value);
    if (selected) {
      setValue("managerName", selected.fullName, { shouldValidate: true });
      setValue("managerContactNumber", selected.phone || "", {
        shouldValidate: true,
      });
    } else {
      setValue("managerName", "", { shouldValidate: true });
      setValue("managerContactNumber", "", { shouldValidate: true });
    }
  };

  const handleSupervisorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = managerOptions.find((person) => person.id === e.target.value);
    if (selected) {
      setValue("supervisorName", selected.fullName, { shouldValidate: true });
      setValue("supervisorContactNumber", selected.phone || "", {
        shouldValidate: true,
      });
    } else {
      setValue("supervisorName", "", { shouldValidate: true });
      setValue("supervisorContactNumber", "", { shouldValidate: true });
    }
  };

  const onSubmitForm = async (data: ProjectFormInputs) => {
    const payload: any = {
      clientFullName: data.clientFullName.trim(),
      clientPhone: data.clientPhone.trim(),
      supervisorName: data.supervisorName.trim(),
      supervisorContactNumber: data.supervisorContactNumber.trim(),
      managerName: data.managerName.trim(),
      managerContactNumber: data.managerContactNumber.trim(),
      siteName: data.siteName,
      region: data.region,
      subregion: data.subregion,
      startDate: data.startDate,
    };
    if (data.clientEmail.trim()) {
      payload.clientEmail = data.clientEmail.trim();
    }
    await createProject(payload);
  };

  const goToBack = () => {
    navigate(-1);
  };

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
          <h1 className="text-2xl text-foreground font-bold  ">
            Create Design Project
          </h1>
        </div>
      </div>

      {/* Form Container */}
      <form
        id="design-project-create-form"
        onSubmit={handleSubmit(onSubmitForm)}
        className="mt-8 w-full animate-slide-up space-y-6"
      >
        <hr className="border-border-main" />

        {/* Form Fields */}
        <div className="space-y-5">
          <div>
            <h2 className="text-sm font-bold text-foreground">Client details</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Login credentials are emailed only when a client email is provided.
            </p>
          </div>

          <div>
            <label className="mb-2 block ui-form-label">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Ali Khan"
              className={`common-input ${errors.clientFullName ? "border-red-500 focus:border-red-500" : ""}`}
              {...register("clientFullName", {
                required: "Full name is required",
                validate: (value) =>
                  value.trim().length > 0 || "Full name is required",
              })}
            />
            {errors.clientFullName && (
              <p className="mt-1.5 text-xs text-red-500 font-semibold">
                {errors.clientFullName.message}
              </p>
            )}
          </div>

          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
            <div>
              <label className="mb-2 block ui-form-label">Email Address</label>
              <input
                type="email"
                placeholder="e.g., ali@example.com (optional)"
                className={`common-input ${errors.clientEmail ? "border-red-500 focus:border-red-500" : ""}`}
                {...register("clientEmail", {
                  validate: (value) => {
                    if (!value?.trim()) return true;
                    return (
                      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ||
                      "Enter a valid email address"
                    );
                  },
                })}
              />
              {errors.clientEmail && (
                <p className="mt-1.5 text-xs text-red-500 font-semibold">
                  {errors.clientEmail.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block ui-form-label">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <Controller
                name="clientPhone"
                control={control}
                rules={{
                  required: "Mobile number is required",
                  validate: (value) => validatePakistanMobile(value),
                }}
                render={({ field }) => (
                  <PakistanPhoneInput
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    hasError={!!errors.clientPhone}
                  />
                )}
              />
              {errors.clientPhone && (
                <p className="mt-1.5 text-xs text-red-500 font-semibold">
                  {errors.clientPhone.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold text-foreground">Project contacts</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Architect and CAD Operator are selected from Employees.
            </p>
          </div>

          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
            <div>
              <label className="mb-2 block ui-form-label">
                Architect Name <span className="text-red-500">*</span>
              </label>
              <input type="hidden" {...register("supervisorName", {
                required: "Architect is required",
              })} />
              <select
                className={`common-input bg-card ${errors.supervisorName ? "border-red-500 focus:border-red-500" : ""}`}
                defaultValue=""
                onChange={handleSupervisorChange}
              >
                <option value="">Select architect</option>
                {managerOptions.map((person) => (
                  <option key={`supervisor-${person.source}-${person.id}`} value={person.id}>
                    {person.fullName}
                  </option>
                ))}
              </select>
              {errors.supervisorName && (
                <p className="mt-1.5 text-xs text-red-500 font-semibold">
                  {errors.supervisorName.message}
                </p>
              )}
            </div>
            <div>
              <label className="mb-2 block ui-form-label">
                Architect Contact Number <span className="text-red-500">*</span>
              </label>
              <Controller
                name="supervisorContactNumber"
                control={control}
                rules={{
                  required: "Architect contact number is required",
                  validate: (value) => {
                    if (!value?.trim()) {
                      return "Selected architect has no phone number";
                    }
                    return (
                      validatePakistanMobile(value) === true ||
                      PAKISTAN_MOBILE_FORMAT_MESSAGE
                    );
                  },
                }}
                render={({ field }) => (
                  <PakistanPhoneInput
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="Auto-filled"
                    readOnly
                    hasError={!!errors.supervisorContactNumber}
                  />
                )}
              />
              {errors.supervisorContactNumber && (
                <p className="mt-1.5 text-xs text-red-500 font-semibold">
                  {errors.supervisorContactNumber.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
            <div>
              <label className="mb-2 block ui-form-label">
                CAD Operator <span className="text-red-500">*</span>
              </label>
              <input type="hidden" {...register("managerName", {
                required: "CAD Operator is required",
              })} />
              <select
                className={`common-input bg-card ${errors.managerName ? "border-red-500 focus:border-red-500" : ""}`}
                defaultValue=""
                onChange={handleManagerChange}
              >
                <option value="">Select CAD operator</option>
                {managerOptions.map((manager) => (
                  <option key={`${manager.source}-${manager.id}`} value={manager.id}>
                    {manager.fullName}
                  </option>
                ))}
              </select>
              {errors.managerName && (
                <p className="mt-1.5 text-xs text-red-500 font-semibold">
                  {errors.managerName.message}
                </p>
              )}
            </div>
            <div>
              <label className="mb-2 block ui-form-label">
                CAD Operator Contact Number <span className="text-red-500">*</span>
              </label>
              <Controller
                name="managerContactNumber"
                control={control}
                rules={{
                  required: "CAD Operator contact number is required",
                  validate: (value) => {
                    if (!value?.trim()) {
                      return "Selected CAD operator has no phone number";
                    }
                    return (
                      validatePakistanMobile(value) === true ||
                      PAKISTAN_MOBILE_FORMAT_MESSAGE
                    );
                  },
                }}
                render={({ field }) => (
                  <PakistanPhoneInput
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="Auto-filled"
                    readOnly
                    hasError={!!errors.managerContactNumber}
                  />
                )}
              />
              {errors.managerContactNumber && (
                <p className="mt-1.5 text-xs text-red-500 font-semibold">
                  {errors.managerContactNumber.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
            <div>
              <label className="mb-2 block ui-form-label">
                Site Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Al-Hafiz Heights"
                className={`common-input ${errors.siteName ? "border-red-500 focus:border-red-500" : ""}`}
                {...register("siteName", {
                  required: "Site Name is required",
                })}
              />
              {errors.siteName && (
                <p className="mt-1.5 text-xs text-red-500 font-semibold">
                  {errors.siteName.message}
                </p>
              )}
            </div>
            <div>
              <label className="mb-2 block ui-form-label">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className={`common-input ${errors.startDate ? "border-red-500 focus:border-red-500" : ""}`}
                {...register("startDate", {
                  required: "Start Date is required",
                })}
              />
              {errors.startDate && (
                <p className="mt-1.5 text-xs text-red-500 font-semibold">
                  {errors.startDate.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
            <div>
              <label className="mb-2 block ui-form-label">
                Region or City
              </label>
              <input
                type="text"
                placeholder="e.g., Lahore"
                className={`common-input ${errors.region ? "border-red-500 focus:border-red-500" : ""}`}
                {...register("region", {
                  required: "Region/City is required",
                })}
              />
              {errors.region && (
                <p className="mt-1.5 text-xs text-red-500 font-semibold">
                  {errors.region.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block ui-form-label">Subregion</label>
              <input
                type="text"
                placeholder="e.g., Johar Town"
                className={`common-input ${errors.subregion ? "border-red-500 focus:border-red-500" : ""}`}
                {...register("subregion", {
                  required: "Subregion is required",
                })}
              />
              {errors.subregion && (
                <p className="mt-1.5 text-xs text-red-500 font-semibold">
                  {errors.subregion.message}
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
              <>
                <Plus size={18} />
                Create Project
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
