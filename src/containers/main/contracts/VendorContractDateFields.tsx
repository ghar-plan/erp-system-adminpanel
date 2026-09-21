import {
  durationDays,
  formatDurationLabel,
} from "./activity-timeline";
import ActivityTimelineBadge from "./ActivityTimelineBadge";
import type {
  FieldErrors,
  UseFormRegister,
  UseFormWatch,
} from "react-hook-form";

type DateFormValues = {
  startDate: string;
  endDate: string;
};

export default function VendorContractDateFields({
  register,
  watch,
  errors,
}: {
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
  errors: FieldErrors<DateFormValues>;
}) {
  const startDate = watch("startDate");
  const endDate = watch("endDate");
  const days = durationDays(startDate, endDate);

  return (
    <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      <div>
        <label className="mb-2 block text-sm font-semibold text-foreground">
          Start Date
        </label>
        <input
          type="date"
          className={`common-input w-full ${errors.startDate ? "border-red-500 focus:border-red-500" : ""}`}
          {...register("startDate", { required: "Start Date is required" })}
        />
        {errors.startDate && (
          <p className="mt-1.5 text-xs text-red-500 font-semibold">
            {errors.startDate.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-foreground">
          End Date
        </label>
        <input
          type="date"
          min={startDate || undefined}
          className={`common-input w-full ${errors.endDate ? "border-red-500 focus:border-red-500" : ""}`}
          {...register("endDate", {
            required: "End Date is required",
            validate: (value) => {
              if (startDate && value && value < startDate) {
                return "End Date cannot be before Start Date";
              }
              return true;
            },
          })}
        />
        {errors.endDate && (
          <p className="mt-1.5 text-xs text-red-500 font-semibold">
            {errors.endDate.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-foreground">
          Activity Duration
        </label>
        <input
          type="text"
          readOnly
          tabIndex={-1}
          value={formatDurationLabel(days)}
          className="common-input w-full bg-muted-foreground/5 cursor-not-allowed text-muted-foreground"
        />
        <p className="mt-1 text-[11px] text-muted-foreground">
          Auto-calculated from Start Date and End Date
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-foreground">
          Activity Timeline
        </label>
        <div className="h-11 flex items-center">
          <ActivityTimelineBadge startDate={startDate} endDate={endDate} />
        </div>
      </div>
    </div>
  );
}
