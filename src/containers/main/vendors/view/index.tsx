import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Pencil, Users, Calendar, MapPin, Phone, Briefcase } from "lucide-react";
import useVendors from "../useHooks";
import { Vendor } from "@/utils/helpers/models/vendors/vendor.dto";

export default function VendorView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getVendorById } = useVendors();
  const [vendor, setVendor] = useState<Vendor | null>(null);

  useEffect(() => {
    if (id) {
      getVendorById(id, setVendor);
    }
  }, [id]);

  if (!vendor) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-2">
        <Users className="animate-pulse text-muted-foreground" size={40} />
        <span className="text-sm font-semibold text-muted-foreground">Loading vendor details...</span>
      </div>
    );
  }

  return (
    <div className="bg-background transition-colors duration-200 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border-main">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Vendors / Overview
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {vendor.vendorName}
          </h1>
        </div>

        <div className="flex items-center gap-3 animate-fade-in">
          <button
            type="button"
            onClick={() => navigate("/vendors")}
            className="flex h-11 px-4 items-center justify-center gap-2 rounded-lg border border-border-main bg-card hover:bg-slate-50 dark:hover:bg-slate-800 text-foreground text-sm font-bold transition-all cursor-pointer shadow-xs"
          >
            <ArrowLeft size={16} />
            Back to List
          </button>

          <Link
            to={`/vendors/edit/${vendor.id}`}
            className="flex h-11 px-5 items-center justify-center gap-2 rounded-lg bg-primary hover:opacity-90 font-bold text-white text-sm transition-all cursor-pointer shadow-sm"
          >
            <Pencil size={16} />
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Profile Card */}
      <div className="app-card border border-border-main max-w-4xl shadow-xs">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">Vendor Profile</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Basic contact information and job criteria.</p>
          </div>
          <hr className="border-border-main" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400">
                <Users size={20} />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Name</span>
                <span className="text-sm font-semibold text-foreground mt-0.5 block">{vendor.vendorName}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400">
                <Briefcase size={20} />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Job Description</span>
                <span className="text-sm font-semibold text-foreground mt-0.5 block">{vendor.jobDescription}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400">
                <Briefcase size={20} />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Vendor Type</span>
                <span className="text-sm font-semibold text-foreground mt-0.5 block">{vendor.vendorType}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400">
                <Phone size={20} />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Phone</span>
                <span className="text-sm font-semibold text-foreground mt-0.5 block">{vendor.phone || "N/A"}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400">
                <MapPin size={20} />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">City</span>
                <span className="text-sm font-semibold text-foreground mt-0.5 block">{vendor.city || "N/A"}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/40 text-muted-foreground">
                <Calendar size={20} />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Registration Date</span>
                <span className="text-sm font-semibold text-foreground mt-0.5 block">
                  {vendor.created_at ? new Date(vendor.created_at).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }) : "N/A"}
                </span>
              </div>
            </div>
          </div>

          <hr className="border-border-main" />
          
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400">
              <MapPin size={20} />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Address</span>
              <p className="text-sm font-semibold text-foreground mt-1 leading-relaxed">
                {vendor.address || "No address logged."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
