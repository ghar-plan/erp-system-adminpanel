import React, { useEffect, useState } from "react";
import { Upload, PlusSquare, Loader2, ArrowLeft, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import useStore from "@/hooks/useStore";
import useProjects from "../useHooks";
import { getFilePathWithBackendUrl } from "@/utils/helpers/common/http-methods";
import { IoArrowBackOutline } from "react-icons/io5";
import {
  ConstructionType,
  PaymentPlan,
  sanitizePercentageInput,
} from "@/utils/helpers/models/projects/project.dto";

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
  mediaId: string | null;
}

export default function Projects() {
  const navigate = useNavigate();
  const { createProject, uploadImage } = useProjects();
  const { isLoading } = useStore();

  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
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
    },
  });

  const paymentPlan = watch("paymentPlan");
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
      clientEmail: data.clientEmail.trim(),
      clientPhone: data.clientPhone.trim(),
      guardName: data.guardName.trim(),
      guardContactNumber: data.guardContactNumber.trim(),
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
    if (data.paymentPlan === PaymentPlan.MARKUP) {
      payload.markupPercentage = Number(data.markupPercentage);
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
        <input
          type="hidden"
          {...register("mediaId", { required: "Cover image is required" })}
        />
        <hr className="border-border-main" />

        {/* Form Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-8">
          {/* LEFT COLUMN: Input Fields */}
          <div className="space-y-5">
            <div>
              <h2 className="text-sm font-bold text-foreground">Client details</h2>
              <p className="text-xs text-muted-foreground mt-1">
                A client account is created with the Client role. Login credentials
                are emailed after the project is saved.
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
                <label className="mb-2 block ui-form-label">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="e.g., ali@example.com"
                  className={`common-input ${errors.clientEmail ? "border-red-500 focus:border-red-500" : ""}`}
                  {...register("clientEmail", {
                    required: "Email address is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Enter a valid email address",
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
                  placeholder="e.g., 03001234567"
                  className={`common-input ${errors.clientPhone ? "border-red-500 focus:border-red-500" : ""}`}
                  {...register("clientPhone", {
                    required: "Mobile number is required",
                    validate: (value) =>
                      value.trim().length >= 7 || "Enter a valid mobile number",
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
                Guard, supervisor, and manager details for this project.
              </p>
            </div>

            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
              <div>
                <label className="mb-2 block ui-form-label">
                  Guard Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Ahmed Ali"
                  className={`common-input ${errors.guardName ? "border-red-500 focus:border-red-500" : ""}`}
                  {...register("guardName", {
                    required: "Guard name is required",
                    validate: (value) =>
                      value.trim().length > 0 || "Guard name is required",
                  })}
                />
                {errors.guardName && (
                  <p className="mt-1.5 text-xs text-red-500 font-semibold">
                    {errors.guardName.message}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-2 block ui-form-label">
                  Guard Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="e.g., 03001234567"
                  className={`common-input ${errors.guardContactNumber ? "border-red-500 focus:border-red-500" : ""}`}
                  {...register("guardContactNumber", {
                    required: "Guard contact number is required",
                    validate: (value) =>
                      value.trim().length >= 7 || "Enter a valid contact number",
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
                <input
                  type="text"
                  placeholder="e.g., Imran Khan"
                  className={`common-input ${errors.supervisorName ? "border-red-500 focus:border-red-500" : ""}`}
                  {...register("supervisorName", {
                    required: "Supervisor name is required",
                    validate: (value) =>
                      value.trim().length > 0 || "Supervisor name is required",
                  })}
                />
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
                  placeholder="e.g., 03001234567"
                  className={`common-input ${errors.supervisorContactNumber ? "border-red-500 focus:border-red-500" : ""}`}
                  {...register("supervisorContactNumber", {
                    required: "Supervisor contact number is required",
                    validate: (value) =>
                      value.trim().length >= 7 || "Enter a valid contact number",
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
                <input
                  type="text"
                  placeholder="e.g., Sara Malik"
                  className={`common-input ${errors.managerName ? "border-red-500 focus:border-red-500" : ""}`}
                  {...register("managerName", {
                    required: "Manager name is required",
                    validate: (value) =>
                      value.trim().length > 0 || "Manager name is required",
                  })}
                />
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
                  placeholder="e.g., 03001234567"
                  className={`common-input ${errors.managerContactNumber ? "border-red-500 focus:border-red-500" : ""}`}
                  {...register("managerContactNumber", {
                    required: "Manager contact number is required",
                    validate: (value) =>
                      value.trim().length >= 7 || "Enter a valid contact number",
                  })}
                />
                {errors.managerContactNumber && (
                  <p className="mt-1.5 text-xs text-red-500 font-semibold">
                    {errors.managerContactNumber.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="mb-2 block ui-form-label">Site Name</label>
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

            <div>
              <label className="mb-2 block ui-form-label">Start Date</label>
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
                    {PaymentPlan.MARKUP}
                  </option>
                </select>
                {errors.paymentPlan && (
                  <p className="mt-1.5 text-xs text-red-500 font-semibold">
                    {errors.paymentPlan.message}
                  </p>
                )}
              </div>
            </div>

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

          {/* RIGHT COLUMN: Cover Image Upload Field inside the same card */}
          <div className="flex flex-col">
            <label className="mb-2 block ui-form-label">Site Cover Image</label>

            <label className="flex-1 flex flex-col justify-center items-center cursor-pointer group">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={uploadingImage}
              />

              <div
                className={`relative w-full h-48 md:h-full min-h-[192px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center p-4 transition-all duration-200 overflow-hidden bg-bg-input/50 ${
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
                  <div className="flex flex-col items-center p-2">
                    <Upload
                      size={26}
                      className="text-muted-foreground group-hover:text-primary transition-colors duration-200 mb-2 stroke-[1.5]"
                    />
                    <span className="text-xs font-bold text-foreground">
                      Upload Image
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-1">
                      PNG, JPG up to 10MB
                    </span>
                    <span className="text-[10px] text-red-500 font-semibold mt-1">
                      * Required
                    </span>
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
