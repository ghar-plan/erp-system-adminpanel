import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Pencil,
  Calendar,
  Wallet,
  StickyNote,
  Tag,
  Repeat,
  Image as ImageIcon,
  FileText,
} from "lucide-react";
import { IoArrowBackOutline } from "react-icons/io5";
import useFixedCosts from "../useHooks";
import {
  FixedCost,
  formatMoney,
  getCategoryLabel,
  getPaymentTypeLabel,
} from "@/utils/helpers/models/fixed-costs/fixed-cost.dto";
import { Can } from "@/components/auth/Can";
import { PERMISSIONS } from "@/utils/helpers/permissions/permission-constants";
import { getFilePathWithBackendUrl } from "@/utils/helpers/common/http-methods";

const isImageUrl = (url?: string) =>
  !!url && /\.(png|jpe?g|gif|webp)(\?|$)/i.test(url);

export default function FixedCostView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getFixedCostById } = useFixedCosts();
  const [fixedCost, setFixedCost] = useState<FixedCost | null>(null);

  useEffect(() => {
    if (id) {
      getFixedCostById(id, setFixedCost);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const goToBack = () => navigate(-1);

  const formatDate = (dateString?: string | Date | null) => {
    if (!dateString) return "--";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch (e) {
      return "--";
    }
  };

  const getPaymentTypeBadgeClass = (paymentType: string) => {
    switch (paymentType) {
      case "monthly":
        return "bg-info-bg text-info-text border border-panel-border";
      case "one_time":
        return "bg-warning-bg text-warning-text border border-panel-border";
      default:
        return "bg-panel-bg text-muted-foreground border border-panel-border";
    }
  };

  if (!fixedCost) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4 flex-wrap animate-fade-in">
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
            Fixed Cost Overview
          </h1>
        </div>
        <Can permission={PERMISSIONS.FIXED_COSTS_UPDATE}>
          <Link
            to={`/fixed-costs/edit/${fixedCost.id}`}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:opacity-90 font-bold text-white transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer whitespace-nowrap text-sm"
          >
            <Pencil size={16} />
            Edit Fixed Cost
          </Link>
        </Can>
      </div>

      <hr className="border-border-main" />

      <div className="bg-card border border-border-main rounded-xl p-6 shadow-xs space-y-6 animate-slide-up">
        <div className="flex items-center gap-4 border-b border-border-main pb-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
            {getCategoryLabel(fixedCost.category).charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {getCategoryLabel(fixedCost.category)}
            </h2>
            <span
              className={`inline-flex items-center text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full mt-1 uppercase ${getPaymentTypeBadgeClass(fixedCost.paymentType)}`}
            >
              {getPaymentTypeLabel(fixedCost.paymentType)}
            </span>
          </div>
        </div>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-info-bg text-info-text">
              <Tag size={18} />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                Category
              </label>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                {getCategoryLabel(fixedCost.category)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-warning-bg text-warning-text">
              <Repeat size={18} />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                Payment Type
              </label>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                {getPaymentTypeLabel(fixedCost.paymentType)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-success-bg text-success-text">
              <Wallet size={18} />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                Amount
              </label>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                {formatMoney(fixedCost.amount)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-accent-bg text-accent-text">
              <Calendar size={18} />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                Date
              </label>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                {formatDate(fixedCost.date)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-info-bg text-info-text">
              <Calendar size={18} />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                Registered On
              </label>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                {fixedCost.created_at ? formatDate(fixedCost.created_at) : "--"}
              </p>
            </div>
          </div>
        </div>

        {(() => {
          const imageUrl = fixedCost.media?.url
            ? getFilePathWithBackendUrl(fixedCost.media.url)
            : "";
          return (
            <div className="border-t border-border-main pt-6">
              <div className="flex items-center gap-2 mb-3 text-muted-foreground">
                <ImageIcon size={18} />
                <span className="text-xs font-bold uppercase tracking-wide">
                  Image
                </span>
              </div>
              {imageUrl ? (
                isImageUrl(imageUrl) ? (
                  <a
                    href={imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block"
                  >
                    <img
                      src={imageUrl}
                      alt="Fixed cost attachment"
                      className="max-h-64 rounded-xl border border-border-main object-contain"
                    />
                  </a>
                ) : (
                  <a
                    href={imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-border-main bg-panel-bg text-sm font-semibold text-primary hover:opacity-90"
                  >
                    <FileText size={18} />
                    View attached file
                  </a>
                )
              ) : (
                <div className="bg-panel-bg border border-panel-border rounded-xl p-4 text-sm text-muted-foreground">
                  No image attached.
                </div>
              )}
            </div>
          );
        })()}

        <div className="border-t border-border-main pt-6">
          <div className="flex items-center gap-2 mb-3 text-muted-foreground">
            <StickyNote size={18} />
            <span className="text-xs font-bold uppercase tracking-wide">
              Remarks
            </span>
          </div>
          <div className="bg-panel-bg border border-panel-border rounded-xl p-4 min-h-[80px] text-sm text-foreground leading-relaxed whitespace-pre-line">
            {fixedCost.remarks || "No remarks added for this fixed cost."}
          </div>
        </div>
      </div>
    </div>
  );
}
