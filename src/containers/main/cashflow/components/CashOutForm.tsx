import React from "react";
import { useForm } from "react-hook-form";
import { ArrowUpCircle, Coins, Loader2 } from "lucide-react";

interface CashOutFormInputs {
  projectId: string;
  vendorId: string;
  activityId: string;
  items: string;
  category: string;
  quantity: string;
  uom: string;
  price: string;
  amount: string;
}

interface CashOutFormProps {
  projects: any[];
  vendors: any[];
  activities: any[];
  onSubmit: (data: CashOutFormInputs) => Promise<void>;
  submitting: boolean;
  editData?: any;
  onCancelEdit?: () => void;
}

export default function CashOutForm({
  projects,
  vendors,
  activities,
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
    formState: { errors },
  } = useForm<CashOutFormInputs>({
    defaultValues: {
      projectId: "",
      vendorId: "",
      activityId: "",
      items: "",
      category: "",
      quantity: "",
      uom: "",
      price: "",
      amount: "",
    },
  });

  const quantity = watch("quantity");
  const price = watch("price");

  // Total is always derived: quantity × price (read-only)
  React.useEffect(() => {
    if (quantity && price && Number(quantity) > 0 && Number(price) > 0) {
      setValue("amount", (Number(quantity) * Number(price)).toFixed(2));
    } else {
      setValue("amount", "");
    }
  }, [quantity, price, setValue]);

  React.useEffect(() => {
    if (editData) {
      const qty = editData.quantity ? Number(editData.quantity) : 0;
      // List/API edit payloads expose amount as grand total (qty × unit rate)
      const total = editData.amount ? Number(editData.amount) : 0;
      const unitPrice = qty > 0 && total > 0 ? total / qty : 0;

      reset({
        projectId: editData.projectId || "",
        vendorId: editData.vendorId || "",
        activityId: editData.activityId || "",
        items: editData.items || "",
        category: editData.category || "",
        quantity: qty ? String(qty) : "",
        uom: editData.uom || "",
        price: unitPrice ? String(unitPrice) : "",
        amount: total ? total.toFixed(2) : "",
      });
    } else {
      reset({
        projectId: "",
        vendorId: "",
        activityId: "",
        items: "",
        category: "",
        quantity: "",
        uom: "",
        price: "",
        amount: "",
      });
    }
  }, [editData, reset]);

  const handleFormSubmit = async (data: CashOutFormInputs) => {
    await onSubmit(data);
    reset({
      projectId: "",
      vendorId: "",
      activityId: "",
      items: "",
      category: "",
      quantity: "",
      uom: "",
      price: "",
      amount: "",
    });
  };

  return (
    <div className="lg:col-span-2 border-l-[5px] border-warning-text rounded-xl bg-card shadow-xs border p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-warning-bg text-warning-text flex items-center justify-center">
          <ArrowUpCircle size={22} className="stroke-[2.5]" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {editData ? "Edit Cash Out" : "Cash Out"}
        </h2>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
        <div className="grid gap-5 grid-cols-1 md:grid-cols-3">
          <div>
            <label className="mb-2 block ui-form-label">SELECT VENDOR</label>
            <select
              className="common-input cursor-pointer"
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
              <p className="mt-1 text-xs text-danger-text font-semibold">
                {errors.vendorId.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block ui-form-label">SELECT ACTIVITY</label>
            <select
              className="common-input cursor-pointer"
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
              <p className="mt-1 text-xs text-danger-text font-semibold">
                {errors.activityId.message}
              </p>
            )}
          </div>

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
        </div>

        <div className="grid gap-5 grid-cols-1 md:grid-cols-3">
          <div className="md:col-span-2">
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

          <div>
            <label className="mb-2 block ui-form-label">CATEGORY</label>
            <select
              className="common-input cursor-pointer"
              {...register("category", { required: "Category is required" })}
            >
              <option value="">Select Category</option>
              <option value="Materials">Materials</option>
              <option value="Labour">Labour</option>
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
        </div>

          <div className="grid gap-5 grid-cols-1 md:grid-cols-4 md:col-span-3">
            <div>
              <label className="mb-2 block ui-form-label">QUANTITY</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                className="common-input"
                {...register("quantity", {
                  required: "Quantity is required",
                  min: {
                    value: 0.01,
                    message: "Quantity must be greater than 0",
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
                {...register("uom", { required: "UOM is required" })}
              >
                <option value="">Select UOM</option>
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
                <option value="Lumpsum">Lumpsum</option>
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
                type="number"
                step="0.01"
                placeholder="Enter Price"
                className="common-input"
                {...register("price", {
                  required: "Price is required",
                  min: { value: 0.01, message: "Price must be greater than 0" },
                })}
              />
              {errors.price && (
                <p className="mt-1 text-xs text-danger-text font-semibold">
                  {errors.price.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block ui-form-label">Total</label>
              <input
                type="number"
                step="0.01"
                placeholder="Auto-calculated"
                readOnly
                tabIndex={-1}
                className="common-input bg-muted-foreground/5 cursor-not-allowed text-muted-foreground"
                {...register("amount")}
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                Auto-calculated from Quantity × Price (Per Item)
              </p>
            </div>
          </div>

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
