import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  User,
  Phone,
  Mail,
  Calendar,
  StickyNote,
  Activity,
  Loader2,
  Save,
  Pencil,
} from "lucide-react";
import { IoArrowBackOutline } from "react-icons/io5";
import useProspects from "../useHooks";
import useStore from "@/hooks/useStore";

interface Prospect {
  id: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
  status: "New" | "Contacted" | "Qualified" | "Lost" | "Converted";
  created_at: string;
  updated_at: string;
}

export default function ProspectView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProspectById, updateProspectStatus } = useProspects();
  const { isLoading } = useStore();

  const [prospect, setProspect] = useState<Prospect | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchProspectDetails = async () => {
    if (id) {
      await getProspectById(id, (data: Prospect) => {
        setProspect(data);
        setSelectedStatus(data.status);
      });
    }
  };

  useEffect(() => {
    fetchProspectDetails();
  }, [id]);

  const handleUpdateStatus = async () => {
    if (id && selectedStatus && prospect) {
      setUpdatingStatus(true);
      await updateProspectStatus(id, selectedStatus, () => {
        fetchProspectDetails();
      });
      setUpdatingStatus(false);
    }
  };

  const goToBack = () => {
    navigate(-1);
  };

  const formatDate = (dateString: string | Date) => {
    try {
      const dateObj = new Date(dateString);
      return dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "N/A";
    }
  };

  const getStatusBadgeClass = (status: string) => {
    if (status === "New") {
      return "bg-info-bg text-info-text border border-panel-border";
    } else if (status === "Contacted") {
      return "bg-warning-bg text-warning-text border border-panel-border";
    } else if (status === "Qualified") {
      return "bg-success-bg text-success-text border border-panel-border";
    } else if (status === "Lost") {
      return "bg-danger-bg text-danger-text border border-panel-border";
    } else if (status === "Converted") {
      return "bg-accent-bg text-accent-text border border-panel-border";
    }
    return "bg-panel-bg text-muted-foreground border border-panel-border";
  };

  if (!prospect) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center gap-4 flex-wrap animate-fade-in font-sans">
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
            Prospect Overview
          </h1>
        </div>
        <Link
          to={`/prospects/edit/${prospect.id}`}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:opacity-90 font-bold text-white transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer whitespace-nowrap text-sm"
        >
          <Pencil size={16} />
          Edit Prospect
        </Link>
      </div>

      <hr className="border-border-main" />

      {/* Detail Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-slide-up">
        {/* Left Column: Core Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border-main rounded-xl p-6 shadow-xs space-y-6">
            <div className="flex items-center gap-4 border-b border-border-main pb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                {prospect?.name?.charAt(0) || "P"}
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {prospect?.name || "--"}
                </h2>
                <span
                  className={`inline-flex items-center text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full mt-1 uppercase ${getStatusBadgeClass(prospect?.status || "")}`}
                >
                  {prospect?.status || "--"}
                </span>
              </div>
            </div>

            {/* Profile fields */}
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
              {/* Phone */}
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-info-bg text-info-text">
                  <Phone size={18} />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                    Phone Number
                  </label>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {prospect?.phone || "--"}
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-success-bg text-success-text">
                  <Mail size={18} />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                    Email Address
                  </label>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {prospect?.email || "--"}
                  </p>
                </div>
              </div>

              {/* Date Created */}
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-warning-bg text-warning-text">
                  <Calendar size={18} />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                    Registered Date
                  </label>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {prospect?.created_at
                      ? formatDate(prospect.created_at)
                      : "--"}
                  </p>
                </div>
              </div>

              {/* Last Updated */}
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-accent-bg text-accent-text">
                  <Calendar size={18} />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                    Last Updated
                  </label>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {prospect?.updated_at
                      ? formatDate(prospect.updated_at)
                      : "--"}
                  </p>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className="border-t border-border-main pt-6">
              <div className="flex items-center gap-2 mb-3 text-muted-foreground">
                <StickyNote size={18} />
                <span className="text-xs font-bold uppercase tracking-wide">
                  Prospect Notes
                </span>
              </div>
              <div className="bg-panel-bg border border-panel-border rounded-xl p-4 min-h-[100px] text-sm text-foreground leading-relaxed whitespace-pre-line">
                {prospect?.notes || "No notes added for this prospect yet."}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Update Status */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border border-border-main rounded-xl p-6 shadow-xs space-y-6">
            <div className="flex items-center gap-3 border-b border-border-main pb-4">
              <div className="w-10 h-10 rounded-full bg-warning-bg text-warning-text flex items-center justify-center">
                <Activity size={20} className="stroke-[2.5]" />
              </div>
              <h3 className="text-lg font-bold text-foreground">
                Update Status
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block ui-form-label">
                  SELECT NEW STATUS
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="common-input bg-card"
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Lost">Lost</option>
                  <option value="Converted">Converted</option>
                </select>
              </div>

              <button
                type="button"
                disabled={updatingStatus || selectedStatus === prospect.status}
                onClick={handleUpdateStatus}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary hover:opacity-95 text-white font-bold text-sm tracking-wide transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updatingStatus ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <>
                    <Save size={16} />
                    Save Status
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
