export enum ConstructionType {
  GREY_STRUCTURE = "Grey Structure Projects",
  FINISHING = "Finishing Projects",
}

export enum PaymentPlan {
  LUMP_SUM = "Lump Sum",
  MARKUP = "Markup",
}

export const sanitizePercentageInput = (value: string): string => {
  const cleaned = value.replace(/[^0-9.]/g, "");
  const [whole, ...decimals] = cleaned.split(".");
  return decimals.length > 0 ? `${whole}.${decimals.join("")}` : whole;
};

export const sanitizeAmountInput = (value: string): string => {
  const cleaned = value.replace(/[^0-9.]/g, "");
  const [whole, ...decimals] = cleaned.split(".");
  const decimal = decimals.join("").slice(0, 2);
  return decimals.length > 0 ? `${whole}.${decimal}` : whole;
};

export const formatProjectAmount = (value?: number | string | null): string => {
  if (value === null || value === undefined || value === "") return "--";
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "--";
  return `PKR ${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export interface Project {
  id: string;
  siteName: string;
  region: string;
  subregion: string;
  startDate?: string | null;
  constructionType?: ConstructionType | string | null;
  paymentPlan?: PaymentPlan | string | null;
  markupPercentage?: number | string | null;
  amount?: number | string | null;
  mediaId?: string | null;
  media?: {
    id: string;
    url: string;
  } | null;
  cashflowsIn?: any[];
  cashflowsOut?: any[];
  guardName?: string | null;
  guardContactNumber?: string | null;
  supervisorName?: string | null;
  supervisorContactNumber?: string | null;
  managerName?: string | null;
  managerContactNumber?: string | null;
  clientUserId?: string | null;
  client?: {
    id: string;
    fullName?: string;
    email?: string;
    phone?: string;
  } | null;
  contracts?: {
    id: string;
    type?: string;
    amount?: number | string;
    description?: string | null;
    created_at?: string;
    startDate?: string | null;
    endDate?: string | null;
    vendor?: { vendorName?: string } | null;
    activity?: { name?: string } | null;
    media?: { id: string; url: string } | null;
  }[];
  created_at: string;
}

export class ProjectDTO {
  id: string = "";
  siteName: string = "";
  region: string = "";
  subregion: string = "";
  startDate?: string | null = null;
  constructionType?: ConstructionType | string | null = null;
  paymentPlan?: PaymentPlan | string | null = null;
  markupPercentage?: number | string | null = null;
  amount?: number | string | null = null;
  mediaId?: string | null = null;
  media?: {
    id: string;
    url: string;
  } | null = null;
  created_at: string = "";
}
