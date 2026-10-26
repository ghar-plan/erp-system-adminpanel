import { Plus, Trash2, X } from "lucide-react";
import type { ChangeEvent } from "react";
import { useEffect, useRef, useState } from "react";
import {
  Control,
  Controller,
  FieldErrors,
  UseFieldArrayReturn,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { sanitizeAmountInput } from "@/utils/helpers/models/design/project.dto";

export type MilestoneRow = {
  id?: string;
  deadline: string;
  workStageIds: string[];
  duration: string;
  payment: string;
};

type WorkStageOption = { id: string; name: string };

type MilestonesTableProps = {
  register: UseFormRegister<any>;
  // RHF Control is invariant; callers pass typed Control via cast.
  control: Control<any, any, any>;
  errors: FieldErrors<any>;
  fields: UseFieldArrayReturn<any, "milestones", "id">["fields"];
  append: UseFieldArrayReturn<any, "milestones", "id">["append"];
  remove: UseFieldArrayReturn<any, "milestones", "id">["remove"];
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
  workStages: WorkStageOption[];
};

function WorkStageMultiSelect({
  options,
  value,
  onChange,
  hasError,
}: {
  options: WorkStageOption[];
  value: string[];
  onChange: (next: string[]) => void;
  hasError?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const selected = options.filter((option) => value.includes(option.id));

  useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const toggle = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((item) => item !== id));
    } else {
      onChange([...value, id]);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`common-input w-full min-h-10 text-left flex flex-wrap gap-1.5 items-center ${
          hasError ? "border-red-500 focus:border-red-500" : ""
        }`}
      >
        {selected.length ? (
          selected.map((stage) => (
            <span
              key={stage.id}
              className="inline-flex items-center gap-1 rounded-md bg-primary/10 text-primary px-2 py-0.5 text-[11px] font-semibold"
            >
              {stage.name}
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  toggle(stage.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    toggle(stage.id);
                  }
                }}
                className="cursor-pointer"
              >
                <X size={12} />
              </span>
            </span>
          ))
        ) : (
          <span className="text-muted-foreground text-sm">Select work stages</span>
        )}
      </button>
      {open ? (
        <div className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto rounded-xl border border-border-main bg-card shadow-lg p-2 space-y-1">
          {options.length ? (
            options.map((stage) => {
              const checked = value.includes(stage.id);
              return (
                <label
                  key={stage.id}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted-foreground/5 cursor-pointer text-sm"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(stage.id)}
                    className="accent-primary"
                  />
                  <span className="text-foreground">{stage.name}</span>
                </label>
              );
            })
          ) : (
            <p className="text-xs text-muted-foreground px-2 py-1.5">
              No work stages available. Add them under Design ? Work Stages.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default function MilestonesTable({
  register,
  control,
  errors,
  fields,
  append,
  remove,
  setValue,
  watch,
  workStages,
}: MilestonesTableProps) {
  const milestoneErrors = errors.milestones as
    | Array<{
        deadline?: { message?: string };
        workStageIds?: { message?: string };
        duration?: { message?: string };
        payment?: { message?: string };
      }>
    | undefined;

  const watchedMilestones = (watch("milestones") || []) as MilestoneRow[];
  const totalPayment = watchedMilestones.reduce((sum, row) => {
    const amount = Number(row?.payment || 0);
    return sum + (Number.isFinite(amount) ? amount : 0);
  }, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-sm font-bold text-foreground">Milestones</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Add deadlines with one or more work stages, duration, and payment.
            Deadline changes are tracked in project history.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            append({
              deadline: "",
              workStageIds: [],
              duration: "",
              payment: "",
            })
          }
          className="flex h-9 px-3 items-center gap-1.5 rounded-md bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold transition-all cursor-pointer"
        >
          <Plus size={14} />
          Add Milestone
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border-main">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="bg-muted-foreground/5 border-b border-border-main">
              <th className="px-3 py-2.5 text-left text-xs font-bold text-foreground w-14">
                S/No.
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-bold text-foreground w-40">
                Deadline
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-bold text-foreground min-w-[220px]">
                Work Stages
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-bold text-foreground w-36">
                Duration
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-bold text-foreground w-40">
                Payment (PKR)
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
                  colSpan={6}
                  className="px-3 py-8 text-center text-xs text-muted-foreground"
                >
                  No milestones added yet. Click Add Milestone to begin.
                </td>
              </tr>
            ) : (
              fields.map((field, index) => (
                <tr key={field.id} className="border-b border-border-main last:border-0">
                  <td className="px-3 py-2.5 text-xs font-semibold text-muted-foreground align-top">
                    {index + 1}
                    <input type="hidden" {...register(`milestones.${index}.id` as const)} />
                  </td>
                  <td className="px-3 py-2.5 align-top">
                    <input
                      type="date"
                      className={`common-input ${
                        milestoneErrors?.[index]?.deadline
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }`}
                      {...register(`milestones.${index}.deadline` as const, {
                        required: "Deadline is required",
                      })}
                    />
                    {milestoneErrors?.[index]?.deadline ? (
                      <p className="mt-1 text-[11px] text-red-500 font-semibold">
                        {milestoneErrors[index]?.deadline?.message}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-3 py-2.5 align-top">
                    <Controller
                      name={`milestones.${index}.workStageIds`}
                      control={control}
                      rules={{
                        validate: (value) =>
                          (Array.isArray(value) && value.length > 0) ||
                          "Select at least one work stage",
                      }}
                      render={({ field: controllerField }) => (
                        <WorkStageMultiSelect
                          options={workStages}
                          value={controllerField.value || []}
                          onChange={controllerField.onChange}
                          hasError={!!milestoneErrors?.[index]?.workStageIds}
                        />
                      )}
                    />
                    {milestoneErrors?.[index]?.workStageIds ? (
                      <p className="mt-1 text-[11px] text-red-500 font-semibold">
                        {milestoneErrors[index]?.workStageIds?.message}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-3 py-2.5 align-top">
                    <input
                      type="text"
                      placeholder="e.g. 15 days"
                      className={`common-input ${
                        milestoneErrors?.[index]?.duration
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }`}
                      {...register(`milestones.${index}.duration` as const, {
                        required: "Duration is required",
                        validate: (value) =>
                          String(value || "").trim().length > 0 ||
                          "Duration is required",
                      })}
                    />
                    {milestoneErrors?.[index]?.duration ? (
                      <p className="mt-1 text-[11px] text-red-500 font-semibold">
                        {milestoneErrors[index]?.duration?.message}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-3 py-2.5 align-top">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="e.g. 150000"
                      className={`common-input ${
                        milestoneErrors?.[index]?.payment
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }`}
                      {...register(`milestones.${index}.payment` as const, {
                        required: "Payment is required",
                        validate: (value) => {
                          if (value === "" || value === undefined) {
                            return "Payment is required";
                          }
                          const num = Number(value);
                          if (!Number.isFinite(num)) return "Enter a valid amount";
                          if (num < 0) return "Payment cannot be below 0";
                          return true;
                        },
                        onChange: (e: ChangeEvent<HTMLInputElement>) => {
                          e.target.value = sanitizeAmountInput(e.target.value);
                          setValue(`milestones.${index}.payment`, e.target.value, {
                            shouldValidate: true,
                            shouldDirty: true,
                          });
                        },
                      })}
                    />
                    {milestoneErrors?.[index]?.payment ? (
                      <p className="mt-1 text-[11px] text-red-500 font-semibold">
                        {milestoneErrors[index]?.payment?.message}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-3 py-2.5 text-right align-top">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Remove milestone"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {fields.length > 0 ? (
            <tfoot>
              <tr className="bg-muted-foreground/5 border-t border-border-main">
                <td
                  colSpan={4}
                  className="px-3 py-3 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Total Payment
                </td>
                <td className="px-3 py-3 text-sm font-bold text-foreground" colSpan={2}>
                  PKR{" "}
                  {totalPayment.toLocaleString("en-US", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </td>
              </tr>
            </tfoot>
          ) : null}
        </table>
      </div>
    </div>
  );
}
