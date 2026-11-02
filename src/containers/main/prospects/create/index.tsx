import React, { useEffect, useMemo, useState } from "react";
import { PlusSquare, Loader2, Save } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import useStore from "@/hooks/useStore";
import useProspects from "../useHooks";
import { IoArrowBackOutline } from "react-icons/io5";
import {
  defaultProspectTypeForModule,
  resolveProspectModule,
} from "@/utils/helpers/models/prospects/prospect-module";

interface ProspectFormInputs {
  name: string;
  phone: string;
  email: string;
  notes: string;
  status: "New" | "Contacted" | "Qualified" | "Negotiation" | "Lost" | "Converted";
  prospectType:
    | "Construction Prospect"
    | "Design Prospect"
    | "Shop Prospect"
    | "";
  project: string;
  leadSource: string;
}

export default function ProspectCreate() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const module = resolveProspectModule(pathname);
  const defaultProspectType = useMemo(
    () => defaultProspectTypeForModule(module),
    [module],
  );
  const { createProspect, getProspectById, updateProspect } = useProspects();
  const { isLoading } = useStore();
  const [prospect, setProspect] = useState<any>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProspectFormInputs>({
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      notes: "",
      status: "" as any,
      prospectType: isEditMode ? "" : defaultProspectType,
      project: "",
      leadSource: "",
    },
  });

  // Keep module default when opening create under Construction / Shop
  useEffect(() => {
    if (!isEditMode) {
      reset((prev) => ({
        ...prev,
        prospectType: defaultProspectType,
      }));
    }
  }, [defaultProspectType, isEditMode, reset]);

  // Load prospect details if editing
  useEffect(() => {
    if (isEditMode && id) {
      getProspectById(id, (data: any) => {
        setProspect(data);
        reset({
          name: data?.name || "",
          phone: data?.phone || "",
          email: data?.email || "",
          notes: data?.notes || "",
          status: data?.status || "",
          prospectType: data?.prospectType || "",
          project: data?.project || "",
          leadSource: data?.leadSource || "",
        });
      });
    }
  }, [id, isEditMode]);

  const onSubmitForm = async (data: ProspectFormInputs) => {
    // Clean empty email to null or omit if empty string
    const payload = {
      ...data,
      email: data.email ? data.email.trim() : undefined,
      notes: data.notes ? data.notes.trim() : undefined,
      project: data.project ? data.project.trim() : undefined,
      leadSource: data.leadSource || undefined,
    };

    if (isEditMode && id) {
      await updateProspect(id, payload);
    } else {
      await createProspect(payload);
    }
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
          <h1 className="text-2xl text-foreground font-bold">
            {isEditMode ? "Edit Prospect Profile" : "Create Prospect"}
          </h1>
        </div>
      </div>

      {/* Form Card Layout */}
      <form
        id="prospect-create-form"
        onSubmit={handleSubmit(onSubmitForm)}
        className="mt-8 w-full animate-slide-up space-y-6"
      >
        <hr className="border-border-main" />

        {/* Form Inputs Grid */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          {/* Name */}
          <div>
            <label className="mb-2 block ui-form-label">Full Name</label>
            <input
              type="text"
              placeholder="e.g. Muhammad Ali"
              className="common-input"
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-danger-text font-semibold">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Phone — any international / local number */}
          <div>
            <label className="mb-2 block ui-form-label">Phone Number</label>
            <input
              type="tel"
              placeholder="e.g. +923001234567 or 03001234567"
              className="common-input"
              {...register("phone", {
                required: "Phone number is required",
                maxLength: {
                  value: 50,
                  message: "Phone number must be at most 50 characters",
                },
              })}
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-danger-text font-semibold">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="mb-2 block ui-form-label">Email Address</label>
            <input
              type="email"
              placeholder="e.g. ali@example.com"
              className="common-input"
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-danger-text font-semibold">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Project */}
          <div>
            <label className="mb-2 block ui-form-label">Project</label>
            <input
              type="text"
              placeholder="e.g. 5 Marla Johar Town"
              className="common-input"
              {...register("project")}
            />
          </div>

          {/* Prospect Type */}
          <div>
            <label className="mb-2 block ui-form-label">Prospect Type</label>
            <select
              className="common-input bg-card"
              {...register("prospectType", {
                required: "Prospect type is required",
              })}
            >
              <option value="">Select Prospect Type</option>
              <option value="Construction Prospect">Construction Prospect</option>
              <option value="Design Prospect">Design Prospect</option>
              <option value="Shop Prospect">Shop Prospect</option>
            </select>
            {errors.prospectType && (
              <p className="mt-1 text-xs text-danger-text font-semibold">
                {errors.prospectType.message}
              </p>
            )}
          </div>

          {/* Lead Source */}
          <div>
            <label className="mb-2 block ui-form-label">Lead Source</label>
            <select
              className="common-input bg-card"
              {...register("leadSource")}
            >
              <option value="">Select Lead Source</option>
              <option value="Facebook">Facebook</option>
              <option value="Instagram">Instagram</option>
              <option value="YouTube">YouTube</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Google / Search">Google / Search</option>
              <option value="Referral">Referral</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Call">Call</option>
              <option value="Website">Website</option>
              <option value="Shop">Shop</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="mb-2 block ui-form-label">Prospect Status</label>
            <select
              className="common-input bg-card"
              {...register("status", { required: "Status is required" })}
            >
              <option value="">Select Status</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Negotiation">Negotiation</option>
              <option value="Lost">Lost</option>
              <option value="Converted">Converted</option>
            </select>
            {errors.status && (
              <p className="mt-1 text-xs text-danger-text font-semibold">
                {errors.status.message}
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="md:col-span-2">
            <label className="mb-2 block ui-form-label">Prospect Notes</label>
            <textarea
              placeholder="e.g. Interested in a 5-marla double-story design design in Johar Town."
              rows={4}
              className="common-input py-3 resize-none"
              {...register("notes")}
            />
          </div>
        </div>

        {/* Action Buttons */}
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
                {isEditMode ? <Save size={18} /> : <PlusSquare size={18} />}
                {isEditMode ? "Save Changes" : "Create Prospect"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
