import React, { useEffect, useState } from "react";
import { Upload, Loader2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFieldArray, useForm } from "react-hook-form";
import useStore from "@/hooks/useStore";
import useProjects from "../useHooks";
import { getFilePathWithBackendUrl } from "@/utils/helpers/common/http-methods";
import { IoArrowBackOutline } from "react-icons/io5";
import {
  ConstructionType,
  PaymentPlan,
  sanitizePercentageInput,
  sanitizeAmountInput,
} from "@/utils/helpers/models/projects/project.dto";
import {
  PAKISTAN_MOBILE_FORMAT_MESSAGE,
  PAKISTAN_MOBILE_PLACEHOLDER,
  validatePakistanMobile,
} from "@/utils/helpers/common/phone";
import PaymentStagesTable from "../PaymentStagesTable";

interface ProjectFormInputs {
  clientFullName: string;
  clientEmail: string;
  clientPhone: string;
  guardName: string;
  guardContactNumber: string;
  supervisorName: string;
  supervisorContactNumber: string;
  managerName: string;
  managerContactNumber: string;
  siteName: string;
  region: string;
  subregion: string;
  startDate: string;
  constructionType: string;
  paymentPlan: string;
  markupPercentage: string;
  amount: string;
  paymentStages: Array<{
    stage: string;
    amount: string;
    expectedDate: string;
  }>;
  mediaId: string | null;
}

export default function Projects() {
  const navigate = useNavigate();
  const { createProject, uploadImage, getManagerOptions } = useProjects();
  const { isLoading } = useStore();

  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [managerOptions, setManagerOptions] = useState<
    Array<{ id: string; fullName: string; phone: string; source: string }>
  >([]);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    formState: { errors },
  } = useForm<ProjectFormInputs>({
    defaultValues: {
      clientFullName: "",
      clientEmail: "",
      clientPhone: "",
      guardName: "",
      guardContactNumber: "",
      supervisorName: "",
      supervisorContactNumber: "",
      managerName: "",
      managerContactNumber: "",
      constructionType: "",
      paymentPlan: "",
      markupPercentage: "",
      amount: "",
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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreviewImageUrl(URL.createObjectURL(file));
    setUploadingImage(true);

    const mediaObj = await uploadImage(file);
    if (mediaObj) {
      setValue("mediaId", mediaObj.id, { shouldValidate: true });
      if (mediaObj.url) {
        setPreviewImageUrl(getFilePathWithBackendUrl(mediaObj.url));
      }
    } else {
      setPreviewImageUrl(null);
      setValue("mediaId", null, { shouldValidate: true });
    }
    setUploadingImage(false);
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
      constructionType: data.constructionType,
      paymentPlan: data.paymentPlan,
    };
    if (data.clientEmail.trim()) {
      payload.clientEmail = data.clientEmail.trim();
    }
    if (data.guardName.trim()) {
      payload.guardName = data.guardName.trim();
    }
    if (data.guardContactNumber.trim()) {
      payload.guardContactNumber = data.guardContactNumber.trim();
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
    }
    if (data.mediaId) {
      payload.mediaId = data.mediaId;
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
            Create Project
          </h1>
        </div>
      </div>

      {/* Form Container */}
      <form
        id="project-create-form"
        onSubmit={handleSubmit(onSubmitForm)}
        className="mt-8 w-full animate-slide-up space-y-6"
      >
        <input type="hidden" {...register("mediaId")} />
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
                <input
                  type="tel"
                  placeholder={PAKISTAN_MOBILE_PLACEHOLDER}
                  className={`common-input ${errors.clientPhone ? "border-red-500 focus:border-red-500" : ""}`}
                  {...register("clientPhone", {
                    required: "Mobile number is required",
                    validate: (value) => validatePakistanMobile(value),
                  })}
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
                Guard is optional. Manager is selected from Employees.
              </p>
            </div>

            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
              <div>
                <label className="mb-2 block ui-form-label">Guard Name</label>
                <input
                  type="text"
                  placeholder="e.g., Ahmed Ali (optional)"
                  className={`common-input ${errors.guardName ? "border-red-500 focus:border-red-500" : ""}`}
                  {...register("guardName")}
                />
              </div>
              <div>
                <label className="mb-2 block ui-form-label">Guard Contact Number</label>
                <input
                  type="tel"
                  placeholder={`${PAKISTAN_MOBILE_PLACEHOLDER} (optional)`}
                  className={`common-input ${errors.guardContactNumber ? "border-red-500 focus:border-red-500" : ""}`}
                  {...register("guardContactNumber", {
                    validate: (value) =>
                      validatePakistanMobile(value, { optional: true }),
                  })}
                />
                {errors.guardContactNumber && (
                  <p className="mt-1.5 text-xs text-red-500 font-semibold">
                    {errors.guardContactNumber.message}
                  </p>
                )}
              </div>
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
                  defaultValue=""
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
                <input
                  type="tel"
                  placeholder="Auto-filled from selected supervisor"
                  readOnly
                  className={`common-input bg-muted-foreground/5 ${errors.supervisorContactNumber ? "border-red-500 focus:border-red-500" : ""}`}
                  {...register("supervisorContactNumber", {
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
                  })}
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
                  defaultValue=""
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
                <input
                  type="tel"
                  placeholder="Auto-filled from selected manager"
                  readOnly
                  className={`common-input bg-muted-foreground/5 ${errors.managerContactNumber ? "border-red-500 focus:border-red-500" : ""}`}
                  {...register("managerContactNumber", {
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
                  })}
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
                  Construction Type{" "}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  className={`common-input bg-card ${errors.constructionType ? "border-red-500 focus:border-red-500" : ""}`}
                  {...register("constructionType", {
                    required: "Construction Type is required",
                  })}
                >
                  <option value="" disabled>
                    Select Construction Type
                  </option>
                  <option value={ConstructionType.GREY_STRUCTURE}>
                    {ConstructionType.GREY_STRUCTURE}
                  </option>
                  <option value={ConstructionType.FINISHING}>
                    {ConstructionType.FINISHING}
                  </option>
                  <option value={ConstructionType.RENOVATION}>
                    {ConstructionType.RENOVATION}
                  </option>
                </select>
                {errors.constructionType && (
                  <p className="mt-1.5 text-xs text-red-500 font-semibold">
                    {errors.constructionType.message}
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

            <div>
              <h2 className="text-sm font-bold text-foreground">Site Cover Image</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Optional. Upload a cover photo for this construction site.
              </p>
            </div>

            <label className="block cursor-pointer group">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={uploadingImage}
              />
              <div
                className={`relative w-full h-44 sm:h-52 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center p-4 transition-all duration-200 overflow-hidden bg-bg-input/50 ${
                  errors.mediaId
                    ? "border-red-500/60 hover:border-red-500"
                    : "border-border-input hover:border-primary/50"
                }`}
              >
                {uploadingImage ? (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground animate-pulse">
                    <Loader2 className="animate-spin text-primary" size={28} />
                    <span className="text-xs font-semibold">Uploading...</span>
                  </div>
                ) : previewImageUrl ? (
                  <>
                    <img
                      src={previewImageUrl}
                      alt="Site cover preview"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-1.5 text-white">
                      <Upload size={20} className="stroke-[2]" />
                      <span className="text-xs font-semibold">
                        Change Cover Image
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 p-2">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Upload
                        size={22}
                        className="text-primary stroke-[1.5]"
                      />
                    </div>
                    <div className="text-center sm:text-left">
                      <span className="block text-sm font-bold text-foreground">
                        Click to upload cover image
                      </span>
                      <span className="block text-xs text-muted-foreground mt-0.5">
                        PNG or JPG, up to 10MB (optional)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </label>

            {errors.mediaId && (
              <p className="mt-1.5 text-xs text-red-500 font-semibold">
                {errors.mediaId.message}
              </p>
            )}
        </div>

        {/* Action Button inside the form card */}
        <div className="flex justify-end pt-4 border-t border-border-main/60">
          <button
            type="submit"
            disabled={isLoading || uploadingImage}
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
