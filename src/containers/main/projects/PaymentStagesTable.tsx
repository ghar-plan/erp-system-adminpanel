import { Plus, Trash2 } from "lucide-react";
import type { ChangeEvent } from "react";
import {
  FieldErrors,
  UseFieldArrayReturn,
  UseFormRegister,
} from "react-hook-form";
import { sanitizeAmountInput } from "@/utils/helpers/models/projects/project.dto";

export type PaymentStageRow = {
  stage: string;
  amount: string;
  expectedDate: string;
};

type PaymentStagesTableProps = {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  fields: UseFieldArrayReturn<any, "paymentStages", "id">["fields"];
  append: UseFieldArrayReturn<any, "paymentStages", "id">["append"];
  remove: UseFieldArrayReturn<any, "paymentStages", "id">["remove"];
};

export default function PaymentStagesTable({
  register,
  errors,
  fields,
  append,
  remove,
}: PaymentStagesTableProps) {
  const stageErrors = errors.paymentStages as
    | Array<{ stage?: { message?: string }; amount?: { message?: string }; expectedDate?: { message?: string } }>
    | undefined;

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-sm font-bold text-foreground">
            Stagewise Payment Plan
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Add payment stages with amount and expected date for this lump sum project.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            append({ stage: "", amount: "", expectedDate: "" })
          }
          className="flex h-9 px-3 items-center gap-1.5 rounded-md bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold transition-all cursor-pointer"
        >
          <Plus size={14} />
          Add Stage
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border-main">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="bg-muted-foreground/5 border-b border-border-main">
              <th className="px-3 py-2.5 text-left text-xs font-bold text-foreground w-16">
                S/ No.
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-bold text-foreground">
                Stage
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-bold text-foreground w-44">
                Amount in PKR
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-bold text-foreground w-44">
                Expected Date
              </th>
              <th className="px-3 py-2.5 text-right text-xs font-bold text-foreground w-14">
                {" "}
              </th>
            </tr>
          </thead>
          <tbody>
            {fields.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-8 text-center text-xs text-muted-foreground"
                >
                  No stages yet. Click &quot;Add Stage&quot; to create a payment schedule.
                </td>
              </tr>
            ) : (
              fields.map((field, index) => (
                <tr
                  key={field.id}
                  className="border-b border-border-main last:border-b-0"
                >
                  <td className="px-3 py-2 align-top text-foreground font-semibold">
                    {index + 1}
                  </td>
                  <td className="px-3 py-2 align-top">
                    <input
                      type="text"
                      placeholder="e.g., Mobilization Advance"
                      className={`common-input h-9 text-sm ${
                        stageErrors?.[index]?.stage
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }`}
                      {...register(`paymentStages.${index}.stage` as const, {
                        required: "Stage is required",
                        validate: (value: string) =>
                          value.trim().length > 0 || "Stage is required",
                      })}
                    />
                    {stageErrors?.[index]?.stage?.message ? (
                      <p className="mt-1 text-[11px] text-red-500 font-semibold">
                        {stageErrors[index]?.stage?.message}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-3 py-2 align-top">
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="e.g., 2000000"
                      className={`common-input h-9 text-sm ${
                        stageErrors?.[index]?.amount
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }`}
                      {...(() => {
                        const { onChange, ...field } = register(
                          `paymentStages.${index}.amount` as const,
                          {
                            required: "Amount is required",
                            validate: (value: string) => {
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
                          },
                        );
                        return {
                          ...field,
                          onChange: (
                            e: ChangeEvent<HTMLInputElement>,
                          ) => {
                            e.target.value = sanitizeAmountInput(e.target.value);
                            onChange(e);
                          },
                        };
                      })()}
                    />
                    {stageErrors?.[index]?.amount?.message ? (
                      <p className="mt-1 text-[11px] text-red-500 font-semibold">
                        {stageErrors[index]?.amount?.message}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-3 py-2 align-top">
                    <input
                      type="date"
                      className={`common-input h-9 text-sm ${
                        stageErrors?.[index]?.expectedDate
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }`}
                      {...register(
                        `paymentStages.${index}.expectedDate` as const,
                        {
                          required: "Expected date is required",
                        },
                      )}
                    />
                    {stageErrors?.[index]?.expectedDate?.message ? (
                      <p className="mt-1 text-[11px] text-red-500 font-semibold">
                        {stageErrors[index]?.expectedDate?.message}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-3 py-2 align-top text-right">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Remove stage"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
