import React from "react";
import { useForm } from "react-hook-form";
import { ArrowUpCircle, Coins, Loader2 } from "lucide-react";
import { parseMoney } from "@/utils/helpers/models/cashflow/cashflow.dto";
import PaymentDetailsFields, {
  emptyPaymentDetails,
  mapPaymentDetailsFromEdit,
} from "./PaymentDetailsFields";
import TypeaheadSelect from "@/containers/main/cashflow/components/TypeaheadSelect";

interface CashOutFormInputs {
  projectId: string;
  vendorMode: "vendor" | "miscellaneous";
  vendorId: string;
  jobId: string;
  workStageId: string;
  items: string;
  amount: string;
  entryDate: string;
  enteredBy: string;
  paymentSource: string;
  status: string;
  paidAmount: string;
  remainingAmount: string;
  chequeNo: string;
  transactionId: string;
  mediaId: string;
  receiptUrl: string;
}

interface CashOutFormProps {
  projects: any[];
  vendors: any[];
  jobs: any[];
  workStages: any[];
  employees: Array<{ id: string; name: string }>;
  onSubmit: (data: CashOutFormInputs) => Promise<void>;
  submitting: boolean;
  editData?: any;
  onCancelEdit?: () => void;
}

export default function CashOutForm({
  projects,
  vendors,
  jobs,
  workStages,
  employees,
  onSubmit,
  submitting,
  editData,
  onCancelEdit,
}: CashOutFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<CashOutFormInputs>({
    defaultValues: {
      projectId: "",
      vendorMode: "vendor",
      vendorId: "",
      jobId: "",
      workStageId: "",
      items: "",
      amount: "",
      ...emptyPaymentDetails,
    },
  });

  const vendorMode = watch("vendorMode");
  const jobId = watch("jobId");
  const isMiscellaneous = vendorMode === "miscellaneous";

  React.useEffect(() => {
    register("jobId", { required: "Material/Service is required" });
  }, [register]);

  React.useEffect(() => {
    if (editData) {
      const isMiscEdit =
        editData.isMiscellaneous === true || !editData.vendorId;
      const total = editData.amount ? Number(editData.amount) : 0;

      reset({
        projectId: editData.projectId || "",
        vendorMode: isMiscEdit ? "miscellaneous" : "vendor",
        vendorId: isMiscEdit ? "" : editData.vendorId || "",
        jobId: editData.jobId || editData.job?.id || "",
        workStageId: editData.workStageId || editData.workStage?.id || "",
        items: editData.items || "",
        amount: total ? Number(total).toFixed(2) : "",
        ...mapPaymentDetailsFromEdit(editData),
      });
    } else {
      reset({
        projectId: "",
        vendorMode: "vendor",
        vendorId: "",
        jobId: "",
        workStageId: "",
        items: "",
        amount: "",
        ...emptyPaymentDetails,
      });
    }
  }, [editData, reset]);

  const handleFormSubmit = async (data: CashOutFormInputs) => {
    await onSubmit(data);
    reset({
      projectId: "",
      vendorMode: "vendor",
      vendorId: "",
      jobId: "",
      workStageId: "",
      items: "",
      amount: "",
      ...emptyPaymentDetails,
    });
  };

  return (
    <div className="lg:col-span-2 border-l-[5px] border-warning-text rounded-xl bg-card shadow-xs border p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-warning-bg text-warning-text flex items-center justify-center">
          <ArrowUpCircle size={22} className="stroke-[2.5]" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {editData ? "Edit Cash Out / Service In" : "Cash Out / Service In"}
        </h2>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
        <div className="grid gap-5 grid-cols-1 md:grid-cols-3">
          <div className="md:col-span-3 space-y-3">
            <label className="mb-2 block ui-form-label">
              VENDOR TYPE <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-3">
              <label
                className={`flex items-center gap-2 px-4 py-2.5 rounded-md border text-sm font-semibold cursor-pointer transition-all ${
                  !isMiscellaneous
                    ? "bg-primary/10 border-primary text-primary"
                    : "border-border-main text-muted-foreground hover:bg-muted-foreground/5"
                }`}
              >
                <input
                  type="radio"
                  value="vendor"
                  className="accent-primary"
                  {...register("vendorMode", { required: true })}
                />
                Select Vendor
              </label>
              <label
                className={`flex items-center gap-2 px-4 py-2.5 rounded-md border text-sm font-semibold cursor-pointer transition-all ${
                  isMiscellaneous
                    ? "bg-primary/10 border-primary text-primary"
                    : "border-border-main text-muted-foreground hover:bg-muted-foreground/5"
                }`}
              >
                <input
                  type="radio"
                  value="miscellaneous"
                  className="accent-primary"
                  {...register("vendorMode", {
                    required: true,
                    onChange: (e) => {
                      if (e.target.value === "miscellaneous") {
                        setValue("vendorId", "");
                        clearErrors("vendorId");
                      }
                    },
                  })}
                />
                Miscellaneous
              </label>
            </div>
          </div>

          {!isMiscellaneous && (
            <div>
              <label className="mb-2 block ui-form-label">SELECT VENDOR</label>
              <select
                className="common-input cursor-pointer"
                {...register("vendorId", {
                  required: !isMiscellaneous ? "Vendor is required" : false,
                })}
              >
                <option value="">Select a Vendor</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.vendorName}
                  </option>
                ))}
              </select>
              {errors.vendorId && (
                <p className="mt-1 text-xs text-danger-text font-semibold">
                  {errors.vendorId.message}
                </p>
              )}
            </div>
          )}

          {isMiscellaneous && (
            <div className="flex items-end">
              <p className="text-sm text-muted-foreground pb-2">
                This expense will be recorded as <strong>Miscellaneous</strong> (no vendor).
              </p>
            </div>
          )}

          <div>
            <label className="mb-2 block ui-form-label">
              SELECT MATERIAL/SERVICE
            </label>
            <TypeaheadSelect
              options={jobs.map((job) => ({
                id: job.id,
                label: job.name,
              }))}
              value={jobId || ""}
              onChange={(value) => {
                setValue("jobId", value, {
                  shouldValidate: true,
                  shouldDirty: true,
                });
              }}
              placeholder="Select a Material/Service"
              searchPlaceholder="Search material/service..."
              emptyText="No material/service found"
              error={errors.jobId?.message}
            />
          </div>

          <div>
            <label className="mb-2 block ui-form-label">WORK STAGE</label>
            <select
              className="common-input cursor-pointer"
              {...register("workStageId", { required: "Work Stage is required" })}
            >
              <option value="">Select Work Stage</option>
              {workStages.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.name}
                </option>
              ))}
            </select>
            {errors.workStageId && (
              <p className="mt-1 text-xs text-danger-text font-semibold">
                {errors.workStageId.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-5 grid-cols-1 md:grid-cols-2">
          <div>
            <label className="mb-2 block ui-form-label">PROJECT</label>
            <select
              className="common-input cursor-pointer"
              {...register("projectId", { required: "Project is required" })}
            >
              <option value="">Select a Project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.siteName}
                </option>
              ))}
            </select>
            {errors.projectId && (
              <p className="mt-1 text-xs text-danger-text font-semibold">
                {errors.projectId.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block ui-form-label">
              ITEM NAME / DESCRIPTION
            </label>
            <input
              type="text"
              placeholder="e.g. Plumbing Service"
              className="common-input"
              {...register("items", { required: "Description is required" })}
            />
            {errors.items && (
              <p className="mt-1 text-xs text-danger-text font-semibold">
                {errors.items.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-5 grid-cols-1 md:grid-cols-2">
          <div>
            <label className="mb-2 block ui-form-label">
              AMOUNT (PKR) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder="Enter Amount"
              className={`common-input ${errors.amount ? "border-red-500 focus:border-red-500" : ""}`}
              {...register("amount", {
                required: "Amount is required",
                setValueAs: (v) =>
                  v === "" || v === null || v === undefined
                    ? ""
                    : String(v).replace(/,/g, "").trim(),
                validate: (v) => {
                  const n = parseMoney(v);
                  if (!Number.isFinite(n) || n < 0.01) {
                    return "Enter a valid amount greater than 0";
                  }
                  return true;
                },
              })}
            />
            {errors.amount && (
              <p className="mt-1 text-xs text-danger-text font-semibold">
                {errors.amount.message}
              </p>
            )}
          </div>
        </div>

        <PaymentDetailsFields
          register={register}
          errors={errors}
          watch={watch}
          setValue={setValue}
          employees={employees}
          isCashOut={true}
          totalAmount={Number(watch("amount") || 0)}
        />

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex h-10 px-6 w-full items-center justify-center gap-2 rounded-md bg-warning-text hover:opacity-90 text-white font-bold text-sm tracking-wide transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <>
                <Coins size={16} />
                {editData ? "UPDATE EXPENSE" : "RECORD EXPENSE"}
              </>
            )}
          </button>
          {editData && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="flex h-10 px-6 items-center justify-center rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 font-bold text-sm tracking-wide transition-all cursor-pointer shadow-sm"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
