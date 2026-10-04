// Mirrors backend DesignProspectType enum values exactly.
export enum DesignProspectType {
  CONSTRUCTION = "Construction Prospect",
  DESIGN = "Design Prospect",
}

export const DESIGN_PROSPECT_TYPE_OPTIONS: Array<{
  value: DesignProspectType;
  label: string;
}> = [
  { value: DesignProspectType.CONSTRUCTION, label: "Construction Prospect" },
  { value: DesignProspectType.DESIGN, label: "Design Prospect" },
];

export const prospectTypeLabel = (value?: string | null): string => {
  if (!value) return "--";
  const match = DESIGN_PROSPECT_TYPE_OPTIONS.find(
    (opt) => opt.value === value,
  );
  return match?.label || value;
};

export enum DesignProspectStatus {
  NEW = "New",
  CONTACTED = "Contacted",
  QUALIFIED = "Qualified",
  LOST = "Lost",
  CONVERTED = "Converted",
}

export interface DesignProspect {
  id: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
  status: DesignProspectStatus;
  prospectType?: DesignProspectType | null;
  project?: string;
  leadSource?: string;
  created_at: string;
  updated_at: string;
}
