import React, { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import useStore from "@/hooks/useStore";
import useDesignProjects from "../useHooks";
import { IoArrowBackOutline } from "react-icons/io5";
import {
  DesignType,
  PaymentPlan,
  sanitizePercentageInput,
  sanitizeAmountInput,
} from "@/utils/helpers/models/design/project.dto";
import {
  PAKISTAN_MOBILE_FORMAT_MESSAGE,
  validatePakistanMobile,
} from "@/utils/helpers/common/phone";
import PakistanPhoneInput from "@/components/ui/PakistanPhoneInput";
import PaymentStagesTable from "../PaymentStagesTable";

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
  designType: string;
  paymentPlan: string;
  markupPercentage: string;
  amount: string;
  paymentStages: Array<{
    stage: string;
    amount: string;
    expectedDate: string;
  }>;
}

export default function DesignProjectEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProjectById, updateProject, getManagerOptions } = useDesignProjects();
  const { isLoading } = useStore();

  const [hasClient, setHasClient] = useState(false);
  const [selectedManagerId, setSelectedManagerId] = useState("");
  const [selectedSupervisorId, setSelectedSupervisorId] = useState("");
  const [managerOptions, setManagerOptions] = useState<
    Array<{ id: string; fullName: string; phone: string; source: string }>
  >([]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<ProjectFormInputs>({
    defaultValues: {
      paymentStages: [],
    },
  });

  const {
    fields: paymentStageFields,
    append: appendPaymentStage,
    remove: removePaymentStage,
    replace: replacePaymentStages,
  } = useFieldArray({
    control,
    name: "paymentStages",
  });

  const paymentPlan = watch("paymentPlan");
  const showAmountField = paymentPlan === PaymentPlan.LUMP_SUM;
  const { onChange: onMarkupChange, ...markupPercentageField } = register(
    "markupPercentage",
    {
      required:
        paymentPlan === PaymentPlan.MARKUP
          ? "Markup percentage is required"
          : false,
      validate: (value) => {
        if (paymentPlan !== PaymentPlan.MARKUP) return true;
        if (value === "" || value === undefined) {
          return "Markup percentage is required";
        }
        const numericValue = Number(value);
        if (!Number.isFinite(numericValue)) {
          return "Only numbers are allowed";
        }
        if (numericValue < 0) {
          return "Markup percentage cannot be below 0";
        }
        if (numericValue > 999.99) {
          return "Markup percentage cannot exceed 999.99";
        }
        return true;
      },
    },
  );

  const { onChange: onAmountChange, ...amountField } = register("amount", {
    required: showAmountField ? "Amount is required" : false,
    validate: (value) => {
      if (!showAmountField) return true;
      if (value === "" || value === undefined) {
        return "Amount is required";
      }
      const numericValue = Number(value);
      if (!Number.isFinite(numericValue)) {
        return "Only numbers are allowed";
      }
      if (numericValue < 0) {
        return "Amount cannot be below 0";
      }
      return true;
    },
  });

  useEffect(() => {
    getManagerOptions(setManagerOptions);
  }, []);

  useEffect(() => {
    if (id) {
      getProjectById(id, (project: any) => {
        setHasClient(Boolean(project.clientUserId || project.client?.id));
        reset({
          clientFullName: project.client?.fullName || "",
          clientEmail: project.client?.email || "",
          clientPhone: project.client?.phone || "",
          supervisorName: project.supervisorName || "",
          supervisorContactNumber: project.supervisorContactNumber || "",
          managerName: project.managerName || "",
          managerContactNumber: project.managerContactNumber || "",
          siteName: project.siteName,
          region: project.region,
          subregion: project.subregion,
          startDate: project.startDate
            ? String(project.startDate).slice(0, 10)
            : "",
          designType: project.designType || "",
          paymentPlan: project.paymentPlan || "",
          markupPercentage:
            project.markupPercentage !== null &&
            project.markupPercentage !== undefined
              ? String(Number(project.markupPercentage))
              : "",
          amount:
            project.amount !== null && project.amount !== undefined
              ? String(Number(project.amount))
              : "",
          paymentStages: (project.paymentStages || [])
            .slice()
            .sort(
              (a: any, b: any) =>
                Number(a.sortOrder || 0) - Number(b.sortOrder || 0),
            )
            .map((stage: any) => ({
              stage: stage.stage || "",
              amount:
                stage.amount !== null && stage.amount !== undefined
                  ? String(Number(stage.amount))
                  : "",
              expectedDate: stage.expectedDate
                ? String(stage.expectedDate).slice(0, 10)
                : "",
            })),
        });
      });
    }
  }, [id]);

  useEffect(() => {
    const managerName = watch("managerName");
    if (!managerName || !managerOptions.length) return;
    const matched = managerOptions.find(
      (manager) => manager.fullName === managerName,
    );
    if (matched) {
      setSelectedManagerId(matched.id);
    }
  }, [managerOptions]);

  useEffect(() => {
    const supervisorName = watch("supervisorName");
    if (!supervisorName || !managerOptions.length) return;
    const matched = managerOptions.find(
      (person) => person.fullName === supervisorName,
    );
    if (matched) {
      setSelectedSupervisorId(matched.id);
    }
  }, [managerOptions]);

  const handleManagerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedManagerId(value);
    const selected = managerOptions.find((manager) => manager.id === value);
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
    const value = e.target.value;
    setSelectedSupervisorId(value);
    const selected = managerOptions.find((person) => person.id === value);
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
    if (id) {
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
        designType: data.designType,
        paymentPlan: data.paymentPlan,
      };
      if (data.clientEmail.trim()) {
        payload.clientEmail = data.clientEmail.trim();
      }
      if (data.paymentPlan === PaymentPlan.MARKUP) {
        payload.markupPercentage = Number(data.markupPercentage);
      }
      if (data.paymentPlan === PaymentPlan.LUMP_SUM) {
        payload.amount = Number(data.amount);
        payload.paymentStages = (data.paymentStages || []).map((stage) => ({
          stage: stage.stage.trim(),
          amount: Number(stage.amount),
          expectedDate: stage.expectedDate,
        }));
      } else {
        payload.paymentStages = [];
      }
      await updateProject(id, payload);
    }
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
            Modify Project Information
          </h1>
        </div>
      </div>

      {/* Form Container */}
      <form
        id="design-project-edit-form"
        onSubmit={handleSubmit(onSubmitForm)}
        className="mt-8 w-full animate-slide-up space-y-6"
      >
        <hr className="border-border-main" />

        {/* Form Fields */}
        <div className="space-y-5">
            <div>
              <h2 className="text-sm font-bold text-foreground">Client details</h2>
              <p className="text-xs text-muted-foreground mt-1">
                {hasClient
                  ? "This project already has a client. Saving updates their details."
                  : "Login credentials are emailed only when a client email is provided."}
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
                  readOnly={hasClient && Boolean(watch("clientEmail"))}
                  disabled={hasClient && Boolean(watch("clientEmail"))}
                  className={`common-input ${errors.clientEmail ? "border-red-500 focus:border-red-500" : ""} ${
                    hasClient && watch("clientEmail")
                      ? "bg-muted-foreground/10 cursor-not-allowed"
                      : ""
                  }`}
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
                {hasClient && watch("clientEmail") ? (
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Email cannot be changed after it is set.
                  </p>
                ) : null}
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
              <h2 className="text-sm font-bold text-foreground">Site contacts</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Supervisor and Manager are selected from Employees.
              </p>
            </div>

            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
              <div>
                <label className="mb-2 block ui-form-label">
                  Supervisor Name <span className="text-red-500">*</span>
                </label>
                <input type="hidden" {...register("supervisorName", {
                  required: "Supervisor is required",
                })} />
                <select
                  className={`common-input bg-card ${errors.supervisorName ? "border-red-500 focus:border-red-500" : ""}`}
                  value={selectedSupervisorId}
                  onChange={handleSupervisorChange}
                >
                  <option value="">Select supervisor</option>
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
                  Supervisor Contact Number <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="supervisorContactNumber"
                  control={control}
                  rules={{
                    required: "Supervisor contact number is required",
                    validate: (value) => {
                      if (!value?.trim()) {
                        return "Selected supervisor has no phone number";
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
                  Manager Name <span className="text-red-500">*</span>
                </label>
                <input type="hidden" {...register("managerName", {
                  required: "Manager is required",
                })} />
                <select
                  className={`common-input bg-card ${errors.managerName ? "border-red-500 focus:border-red-500" : ""}`}
                  value={selectedManagerId}
                  onChange={handleManagerChange}
                >
                  <option value="">Select manager</option>
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
                  Manager Contact Number <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="managerContactNumber"
                  control={control}
                  rules={{
                    required: "Manager contact number is required",
                    validate: (value) => {
                      if (!value?.trim()) {
                        return "Selected manager has no phone number";
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

            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
              <div>
                <label className="mb-2 block ui-form-label">
                  Design Type{" "}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  className={`common-input bg-card ${errors.designType ? "border-red-500 focus:border-red-500" : ""}`}
                  {...register("designType", {
                    required: "Design Type is required",
                  })}
                >
                  <option value="" disabled>
                    Select Design Type
                  </option>
                  <option value={DesignType.GREY_STRUCTURE}>
                    {DesignType.GREY_STRUCTURE}
                  </option>
                  <option value={DesignType.FINISHING}>
                    {DesignType.FINISHING}
                  </option>
                  <option value={DesignType.RENOVATION}>
                    {DesignType.RENOVATION}
                  </option>
                </select>
                {errors.designType && (
                  <p className="mt-1.5 text-xs text-red-500 font-semibold">
                    {errors.designType.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block ui-form-label">
                  Payment Plan <span className="text-red-500">*</span>
                </label>
                <select
                  className={`common-input bg-card ${errors.paymentPlan ? "border-red-500 focus:border-red-500" : ""}`}
                  {...register("paymentPlan", {
                    required: "Payment Plan is required",
                    onChange: (e) => {
                      if (e.target.value !== PaymentPlan.MARKUP) {
                        setValue("markupPercentage", "");
                      }
                      if (e.target.value !== PaymentPlan.LUMP_SUM) {
                        setValue("amount", "");
                        replacePaymentStages([]);
                      }
                    },
                  })}
                >
                  <option value="" disabled>
                    Select Payment Plan
                  </option>
                  <option value={PaymentPlan.LUMP_SUM}>
                    {PaymentPlan.LUMP_SUM}
                  </option>
                  <option value={PaymentPlan.MARKUP}>
                    Cost Plus
                  </option>
                </select>
                {errors.paymentPlan && (
                  <p className="mt-1.5 text-xs text-red-500 font-semibold">
                    {errors.paymentPlan.message}
                  </p>
                )}
              </div>
            </div>

            {showAmountField && (
              <div>
                <label className="mb-2 block ui-form-label">
                  {paymentPlan === PaymentPlan.LUMP_SUM
                    ? "Lump Sum Amount"
                    : "Amount"}{" "}
                  (PKR) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="e.g. 2500000"
                  className={`common-input ${errors.amount ? "border-red-500 focus:border-red-500" : ""}`}
                  {...amountField}
                  onChange={(e) => {
                    e.target.value = sanitizeAmountInput(e.target.value);
                    onAmountChange(e);
                  }}
                />
                {errors.amount && (
                  <p className="mt-1.5 text-xs text-red-500 font-semibold">
                    {errors.amount.message}
                  </p>
                )}
              </div>
            )}

            {paymentPlan === PaymentPlan.LUMP_SUM && (
              <PaymentStagesTable
                register={register}
                errors={errors}
                fields={paymentStageFields}
                append={appendPaymentStage}
                remove={removePaymentStage}
              />
            )}

            {paymentPlan === PaymentPlan.MARKUP && (
              <div>
                <label className="mb-2 block ui-form-label">
                  Markup Percentage <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="e.g. 12"
                    className={`common-input pr-10 ${errors.markupPercentage ? "border-red-500 focus:border-red-500" : ""}`}
                    {...markupPercentageField}
                    onChange={(e) => {
                      e.target.value = sanitizePercentageInput(e.target.value);
                      onMarkupChange(e);
                    }}
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                    %
                  </span>
                </div>
                {errors.markupPercentage && (
                  <p className="mt-1.5 text-xs text-red-500 font-semibold">
                    {errors.markupPercentage.message}
                  </p>
                )}
              </div>
            )}

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
                <Save size={18} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
