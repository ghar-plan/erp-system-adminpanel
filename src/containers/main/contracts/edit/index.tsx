import React, { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import useStore from "@/hooks/useStore";
import useContracts from "../useHooks";
import useActivities from "../../activities/useHooks";
import useVendors from "../../vendors/useHooks";
import useProjects from "../../projects/useHooks";
import { IoArrowBackOutline } from "react-icons/io5";

interface ContractFormInputs {
  vendorId: string;
  projectId: string;
  activityId: string;
  description: string;
  amount: number;
}

export default function ContractEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getContractById, updateContract } = useContracts();
  const { getAllActivities } = useActivities();
  const { getAllVendors } = useVendors();
  const { getAllProjects } = useProjects();
  const { isLoading } = useStore();

  const [activities, setActivities] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [initialDataLoading, setInitialDataLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContractFormInputs>();

  useEffect(() => {
    const fetchInitialData = async () => {
      getAllActivities(setActivities);
      getAllVendors(setVendors);
      getAllProjects(setProjects);

      if (id) {
        await getContractById(id, (data: any) => {
          reset({
            vendorId: data.vendorId || data.vendor?.id,
            projectId: data.projectId || data.project?.id,
            activityId: data.activityId || data.activity?.id,
            description: data.description,
            amount: data.amount,
          });
          setInitialDataLoading(false);
        });
      }
    };
    fetchInitialData();
  }, [id]);

  const onSubmitForm = async (data: ContractFormInputs) => {
    if (id) {
      await updateContract(id, {
        vendorId: data.vendorId,
        projectId: data.projectId,
        activityId: data.activityId,
        description: data.description?.trim(),
        amount: Number(data.amount),
      });
    }
  };

  const goToBack = () => {
    navigate(-1);
  };

  if (initialDataLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div>
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
          <h1 className="text-2xl text-foreground font-bold">
            Edit Contract
          </h1>
        </div>
      </div>

      <form
        id="contract-edit-form"
        onSubmit={handleSubmit(onSubmitForm)}
        className="mt-8 w-full animate-slide-up space-y-6 bg-card border border-border-main p-6 rounded-xl shadow-xs"
      >
        <div className="space-y-5">
          <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">Vendor</label>
              <select
                className={`common-input w-full ${errors.vendorId ? "border-red-500 focus:border-red-500" : ""}`}
                {...register("vendorId", { required: "Vendor is required" })}
              >
                <option value="">Select Vendor</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.vendorName}
                  </option>
                ))}
              </select>
              {errors.vendorId && (
                <p className="mt-1.5 text-xs text-red-500 font-semibold">
                  {errors.vendorId.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">Project</label>
              <select
                className={`common-input w-full ${errors.projectId ? "border-red-500 focus:border-red-500" : ""}`}
                {...register("projectId", { required: "Project is required" })}
              >
                <option value="">Select Project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.siteName}
                  </option>
                ))}
              </select>
              {errors.projectId && (
                <p className="mt-1.5 text-xs text-red-500 font-semibold">
                  {errors.projectId.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">Activity</label>
              <select
                className={`common-input w-full ${errors.activityId ? "border-red-500 focus:border-red-500" : ""}`}
                {...register("activityId", { required: "Activity is required" })}
              >
                <option value="">Select Activity</option>
                {activities.map((activity) => (
                  <option key={activity.id} value={activity.id}>
                    {activity.name}
                  </option>
                ))}
              </select>
              {errors.activityId && (
                <p className="mt-1.5 text-xs text-red-500 font-semibold">
                  {errors.activityId.message}
                </p>
              )}
            </div>
            
            <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Amount (PKR)</label>
                <input
                  type="number"
                  placeholder="e.g. 150000"
                  step="0.01"
                  min="0"
                  className={`common-input w-full ${errors.amount ? "border-red-500 focus:border-red-500" : ""}`}
                  {...register("amount", { 
                    required: "Amount is required",
                    min: { value: 0, message: "Amount must be greater than or equal to 0" }
                  })}
                />
                {errors.amount && (
                  <p className="mt-1.5 text-xs text-red-500 font-semibold">
                    {errors.amount.message}
                  </p>
                )}
              </div>
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label className="mb-2 block text-sm font-semibold text-foreground">Description</label>
              <textarea
                placeholder="Enter contract description..."
                rows={4}
                className={`common-input w-full resize-none ${errors.description ? "border-red-500 focus:border-red-500" : ""}`}
                {...register("description", { maxLength: { value: 500, message: "Description cannot exceed 500 characters" } })}
              ></textarea>
              {errors.description && (
                <p className="mt-1.5 text-xs text-red-500 font-semibold">
                  {errors.description.message}
                </p>
              )}
            </div>

          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-border-main/60">
          <button
            type="submit"
            disabled={isLoading}
            className="flex h-10 px-6 items-center justify-center gap-2 rounded-md bg-primary hover:opacity-95 font-semibold text-white text-sm transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed animate-fade-in"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
