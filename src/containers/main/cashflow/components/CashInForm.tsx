import React from "react";
import { useForm } from "react-hook-form";
import { ArrowDownCircle, Coins, Loader2 } from "lucide-react";

interface CashInFormInputs {
  projectId: string;
  installment: string;
  amount: string;
}

interface CashInFormProps {
  projects: any[];
  onSubmit: (data: CashInFormInputs) => Promise<void>;
  submitting: boolean;
}

export default function CashInForm({
  projects,
  onSubmit,
  submitting,
}: CashInFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CashInFormInputs>({
    defaultValues: {
      projectId: "",
      installment: "",
      amount: "",
    },
  });

  const handleFormSubmit = async (data: CashInFormInputs) => {
    await onSubmit(data);
    reset({
      projectId: "",
      installment: "",
      amount: "",
    });
  };

  return (
    <div className="lg:col-span-1 border-l-[5px] border-primary rounded-xl bg-card shadow-xs border  p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
          <ArrowDownCircle size={22} className="stroke-[2.5]" />
        </div>
        <h2 className="text-xl font-bold text-foreground  ">Cash In</h2>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
        <div>
          <label className="mb-2 block ui-form-label">SELECT PROJECT</label>
          <select
            className="common-input"
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
          <label className="mb-2 block ui-form-label">SELECT INSTALLMENT</label>
          <input
            type="text"
            placeholder="e.g. 1st Installment (Booking)"
            className="common-input"
            {...register("installment", {
              required: "Installment is required",
            })}
          />
          {errors.installment && (
            <p className="mt-1 text-xs text-danger-text font-semibold">
              {errors.installment.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block ui-form-label">AMOUNT (PKR)</label>
          <input
            type="number"
            step="0.01"
            placeholder="Enter Amount"
            className="common-input"
            {...register("amount", {
              required: "Amount is required",
              min: { value: 0.01, message: "Amount must be greater than 0" },
            })}
          />
          {errors.amount && (
            <p className="mt-1 text-xs text-danger-text font-semibold">
              {errors.amount.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex h-10 px-6 w-full items-center justify-center gap-2 rounded-md bg-primary hover:opacity-95 text-white font-bold text-sm tracking-wide transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <>
              <Coins size={16} />
              RECORD PAYMENT
            </>
          )}
        </button>
      </form>
    </div>
  );
}
