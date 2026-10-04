import React from "react";
import { useForm } from "react-hook-form";
import { ArrowUpCircle, Coins, Loader2 } from "lucide-react";
import { parseMoney, multiplyMoney, divideMoney, toMoneyNumber } from "@/utils/helpers/models/cashflow/cashflow.dto";
import PaymentDetailsFields, {
  emptyPaymentDetails,
  mapPaymentDetailsFromEdit,
} from "./PaymentDetailsFields";
import TypeaheadSelect from "./TypeaheadSelect";

interface CashOutFormInputs {
  projectId: string;
  vendorMode: "vendor" | "miscellaneous";
  vendorId: string;
  jobId: string;
  workStageId: string;
  items: string;
  category: string;
  quantity: string;
  uom: string;
  price: string;
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
  units: any[];
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
  units,
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
      category: "",
      quantity: "",
      uom: "",
      price: "",
      amount: "",
      ...emptyPaymentDetails,
    },
  });

  const quantity = watch("quantity");
  const price = watch("price");
  const category = watch("category");
  const vendorMode = watch("vendorMode");
  const jobId = watch("jobId");
  const isLabour = category === "Labour";
  const isMiscellaneous = vendorMode === "miscellaneous";

  React.useEffect(() => {
    register("jobId", { required: "Material/Service is required" });
  }, [register]);

  // Total is derived from quantity × price, except Labour (manual total only)
  React.useEffect(() => {
    if (isLabour) return;
    const qty = parseMoney(quantity);
    const unit = parseMoney(price);
    if (qty > 0 && unit > 0) {
      setValue("amount", multiplyMoney(qty, unit).toFixed(2));
    } else {
      setValue("amount", "");
    }
  }, [quantity, price, isLabour, setValue]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === "Labour") {
      // Fresh labour entry: clear qty/price/total so admin types the exact total
      setValue("quantity", "");
      setValue("uom", "");
      setValue("price", "");
      setValue("amount", "");
    }
  };

  const categoryField = register("category", { required: "Category is required" });

  React.useEffect(() => {
    if (editData) {
      const isLabourEdit = editData.category === "Labour";
      const isMiscEdit =
        editData.isMiscellaneous === true || !editData.vendorId;
      const qty = editData.quantity ? Number(editData.quantity) : 0;
      // List/API edit payloads expose amount as grand total (qty × unit rate)
      const total = editData.amount ? Number(editData.amount) : 0;
      const unitPrice =
        !isLabourEdit && qty > 0 && total > 0 ? divideMoney(total, qty) : 0;

      reset({
        projectId: editData.projectId || "",
        vendorMode: isMiscEdit ? "miscellaneous" : "vendor",
        vendorId: isMiscEdit ? "" : editData.vendorId || "",
        jobId: editData.jobId || editData.job?.id || "",
        workStageId: editData.workStageId || editData.workStage?.id || "",
        items: editData.items || "",
        category: editData.category || "",
        quantity: isLabourEdit ? "" : qty ? String(qty) : "",
        uom: isLabourEdit ? "" : editData.uom || "",
        price: isLabourEdit ? "" : unitPrice ? unitPrice.toFixed(2) : "",
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
        category: "",
        quantity: "",
        uom: "",
        price: "",
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
      category: "",
      quantity: "",
      uom: "",
      price: "",
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
          {editData ? "Edit Cash Out / Material In" : "Cash Out / Material In"}
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
              placeholder="e.g. 5000 Grade A Bricks"
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

        <div
          className={`grid gap-5 grid-cols-1 ${
            isLabour ? "md:grid-cols-2" : "md:grid-cols-4 xl:grid-cols-5"
          }`}
        >
          <div>
            <label className="mb-2 block ui-form-label">CATEGORY</label>
            <select
              className="common-input cursor-pointer"
              {...categoryField}
              onChange={(e) => {
                categoryField.onChange(e);
                handleCategoryChange(e);
              }}
            >
              <option value="">Select Category</option>
              <option value="Materials">Materials</option>
              <option value="Labour">Labour</option>
              <option value="Asserts">Asserts</option>
              <option value="Overheads">Overheads</option>
              <option value="Machinery">Machinery</option>
              <option value="Other">Other</option>
            </select>
            {errors.category && (
              <p className="mt-1 text-xs text-danger-text font-semibold">
                {errors.category.message}
              </p>
            )}
          </div>

          {!isLabour && (
            <>
              <div>
                <label className="mb-2 block ui-form-label">QUANTITY</label>
                <input
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="0.00"
                  className="common-input"
                  {...register("quantity", {
                    required: !isLabour ? "Quantity is required" : false,
                    setValueAs: (v) =>
                      v === "" || v === null || v === undefined
                        ? ""
                        : String(v).replace(/,/g, "").trim(),
                    validate: (v) => {
                      if (isLabour) return true;
                      const n = parseMoney(v);
                      if (!Number.isFinite(n) || n < 0.01) {
                        return "Quantity must be greater than 0";
                      }
                      return true;
                    },
                  })}
                />
                {errors.quantity && (
                  <p className="mt-1 text-xs text-danger-text font-semibold">
                    {errors.quantity.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block ui-form-label">UOM (UNIT)</label>
                <select
                  className="common-input cursor-pointer"
                  {...register("uom", {
                    required: !isLabour ? "UOM is required" : false,
                  })}
                >
                  <option value="">Select UOM</option>
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.name}>
                      {unit.name}
                    </option>
                  ))}
                </select>
                {errors.uom && (
                  <p className="mt-1 text-xs text-danger-text font-semibold">
                    {errors.uom.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block ui-form-label">PRICE (Per Item)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="Enter Price"
                  className="common-input"
                  {...register("price", {
                    required: !isLabour ? "Price is required" : false,
                    setValueAs: (v) =>
                      v === "" || v === null || v === undefined
                        ? ""
                        : String(v).replace(/,/g, "").trim(),
                    validate: (v) => {
                      if (isLabour) return true;
                      const n = parseMoney(v);
                      if (!Number.isFinite(n) || n < 0.01) {
                        return "Price must be greater than 0";
                      }
                      return true;
                    },
                  })}
                />
                {errors.price && (
                  <p className="mt-1 text-xs text-danger-text font-semibold">
                    {errors.price.message}
                  </p>
                )}
              </div>
            </>
          )}

          <div>
            <label className="mb-2 block ui-form-label">Total</label>
            <input
              type={isLabour ? "text" : "number"}
              inputMode="decimal"
              step="0.01"
              placeholder={isLabour ? "e.g. 10500" : "Auto-calculated"}
              readOnly={!isLabour}
              tabIndex={isLabour ? 0 : -1}
              className={`common-input ${
                isLabour
                  ? ""
                  : "bg-muted-foreground/5 cursor-not-allowed text-muted-foreground"
              }`}
              {...register("amount", {
                required: isLabour ? "Total is required" : false,
                setValueAs: (v) => {
                  if (v === "" || v === null || v === undefined) return "";
                  const cleaned = String(v).replace(/,/g, "").trim();
                  return cleaned;
                },
                validate: (v) => {
                  if (!isLabour) return true;
                  const n = parseMoney(v);
                  if (!Number.isFinite(n) || n < 0.01) {
                    return "Enter a valid total greater than 0";
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
