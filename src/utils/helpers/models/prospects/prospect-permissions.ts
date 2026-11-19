import { PERMISSIONS } from "@/utils/helpers/permissions/permission-constants";
import type { ProspectModule } from "./prospect-module";

export function prospectPermissionsForModule(module: ProspectModule) {
  if (module === "shop") {
    return {
      create: PERMISSIONS.COMMERCE_PROSPECT_CREATE,
      read: PERMISSIONS.COMMERCE_PROSPECT_READ,
      update: PERMISSIONS.COMMERCE_PROSPECT_UPDATE,
      delete: PERMISSIONS.COMMERCE_PROSPECT_DELETE,
    };
  }
  if (module === "design") {
    return {
      create: PERMISSIONS.DESIGN_PROSPECT_CREATE,
      read: PERMISSIONS.DESIGN_PROSPECT_READ,
      update: PERMISSIONS.DESIGN_PROSPECT_UPDATE,
      delete: PERMISSIONS.DESIGN_PROSPECT_DELETE,
    };
  }
  return {
    create: PERMISSIONS.PROSPECT_CREATE,
    read: PERMISSIONS.PROSPECT_READ,
    update: PERMISSIONS.PROSPECT_UPDATE,
    delete: PERMISSIONS.PROSPECT_DELETE,
  };
}
