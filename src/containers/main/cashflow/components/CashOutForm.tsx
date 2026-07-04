import React from "react";
import { useForm } from "react-hook-form";
import { ArrowUpCircle, Coins, Loader2, AlertCircle } from "lucide-react";

interface CashOutFormInputs {
  projectId: string;
  vendorId: string;
  activityId: string;
  items: string;
  category: string;
  quantity: string;
  uom: string;
  amount: string;
}

interface CashOutFormProps {
  projects: any[];
  vendors: any[];
  activities: any[];
  onSubmit: (data: CashOutFormInputs) => Promise<void>;
  submitting: boolean;
}

export default function CashOutForm({
  projects,
  vendors,
  activities,
  onSubmit,
  submitting,
}: CashOutFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CashOutFormInputs>({
    defaultValues: {
      projectId: "",
      vendorId: "",
      activityId: "",
      items: "",
      category: "Materials",
      quantity: "",
      uom: "CFT",
      amount: "",
    },
  });

  const handleFormSubmit = async (data: CashOutFormInputs) => {
    await onSubmit(data);
    reset({
      projectId: "",
      vendorId: "",
      activityId: "",
      items: "",
      category: "Materials",
      quantity: "",
      uom: "CFT",
      amount: "",
    });
  };

  return (
    <div className="lg:col-span-2 border-l-[5px] border-orange-500 rounded-xl bg-card shadow-xs border border-border-main p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center">
          <ArrowUpCircle size={22} className="stroke-[2.5]" />
        </div>
        <h2 className="text-xl font-bold text-foreground font-sans">
          Cash Out
        </h2>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
        <div className="grid gap-5 grid-cols-1 md:grid-cols-3">
          <div>
            <label className="mb-2 block ui-form-label">SELECT VENDOR</label>
            <select
              className={`common-input !rounded-lg ${errors.vendorId ? "border-red-500" : ""}`}
              {...register("vendorId", { required: "Vendor is required" })}
            >
              <option value="">Select a Vendor</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.vendorName}
                </option>
              ))}
            </select>
            {errors.vendorId && (
              <p className="mt-1 text-xs text-red-500 font-semibold flex items-center gap-1">
                <AlertCircle size={12} /> {errors.vendorId.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block ui-form-label">SELECT ACTIVITY</label>
            <select
              className={`common-input !rounded-lg ${errors.activityId ? "border-red-500" : ""}`}
              {...register("activityId", { required: "Activity is required" })}
            >
              <option value="">Select an Activity</option>
              {activities.map((act) => (
                <option key={act.id} value={act.id}>
                  {act.name}
                </option>
              ))}
            </select>
            {errors.activityId && (
              <p className="mt-1 text-xs text-red-500 font-semibold flex items-center gap-1">
                <AlertCircle size={12} /> {errors.activityId.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block ui-form-label">PROJECT</label>
            <select
              className={`common-input !rounded-lg ${errors.projectId ? "border-red-500" : ""}`}
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
              <p className="mt-1 text-xs text-red-500 font-semibold flex items-center gap-1">
                <AlertCircle size={12} /> {errors.projectId.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-5 grid-cols-1 md:grid-cols-3">
          <div className="md:col-span-2">
            <label className="mb-2 block ui-form-label">
              ITEM NAME / DESCRIPTION
            </label>
            <input
              type="text"
              placeholder="e.g. 5000 Grade A Bricks"
              className={`common-input !rounded-lg ${errors.items ? "border-red-500" : ""}`}
              {...register("items", { required: "Description is required" })}
            />
            {errors.items && (
              <p className="mt-1 text-xs text-red-500 font-semibold flex items-center gap-1">
                <AlertCircle size={12} /> {errors.items.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block ui-form-label">CATEGORY</label>
            <select
              className="common-input !rounded-lg"
              {...register("category")}
            >
              <option value="Materials">Materials</option>
              <option value="Labour">Labour</option>
              <option value="Overheads">Overheads</option>
              <option value="Machinery">Machinery</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="grid gap-5 grid-cols-1 md:grid-cols-3">
          <div>
            <label className="mb-2 block ui-form-label">QUANTITY</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              className={`common-input !rounded-lg ${errors.quantity ? "border-red-500" : ""}`}
              {...register("quantity", {
                required: "Quantity is required",
                min: {
                  value: 0.01,
                  message: "Quantity must be greater than 0",
                },
              })}
            />
            {errors.quantity && (
              <p className="mt-1 text-xs text-red-500 font-semibold flex items-center gap-1">
                <AlertCircle size={12} /> {errors.quantity.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block ui-form-label">UOM (UNIT)</label>
            <select className="common-input !rounded-lg" {...register("uom")}>
              <option value="CFT">CFT</option>
              <option value="Bags">Bags</option>
              <option value="Rft">Rft</option>
              <option value="Sft">Sft</option>
              <option value="Nos">Nos</option>
              <option value="Kg">Kg</option>
              <option value="Liters">Liters</option>
              <option value="Tons">Tons</option>
              <option value="Hours">Hours</option>
              <option value="Days">Days</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block ui-form-label">TOTAL AMOUNT</label>
            <input
              type="number"
              step="0.01"
              placeholder="Enter Amount"
              className={`common-input !rounded-lg ${errors.amount ? "border-red-500" : ""}`}
              {...register("amount", {
                required: "Total amount is required",
                min: { value: 0.01, message: "Amount must be greater than 0" },
              })}
            />
            {errors.amount && (
              <p className="mt-1 text-xs text-red-500 font-semibold flex items-center gap-1">
                <AlertCircle size={12} /> {errors.amount.message}
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex h-10 px-6 w-full items-center justify-center gap-2 rounded-md bg-[#F97316] hover:bg-orange-600 text-white font-bold text-sm tracking-wide transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <>
              <Coins size={16} />
              RECORD EXPENSE
            </>
          )}
        </button>
      </form>
    </div>
  );
}
