import { siteRoutes } from "@/utils/helpers/enums/routes.enum";

export type ProspectModule = "construction" | "shop" | "design";

export type ProspectTypeValue =
  | "Construction Prospect"
  | "Design Prospect"
  | "Shop Prospect";

export function resolveProspectModule(pathname: string): ProspectModule {
  if (pathname.startsWith("/shop/prospects")) return "shop";
  if (pathname.startsWith("/design/prospects")) return "design";
  return "construction";
}

export function defaultProspectTypeForModule(
  module: ProspectModule,
): ProspectTypeValue {
  switch (module) {
    case "shop":
      return "Shop Prospect";
    case "design":
      return "Design Prospect";
    default:
      return "Construction Prospect";
  }
}

export function prospectBasePath(module: ProspectModule): string {
  switch (module) {
    case "shop":
      return siteRoutes.shopProspects;
    case "design":
      return siteRoutes.designProspects;
    default:
      return siteRoutes.prospects;
  }
}

export function prospectCreatePath(module: ProspectModule): string {
  switch (module) {
    case "shop":
      return siteRoutes.shopProspectsCreate;
    case "design":
      return siteRoutes.designProspectsCreate;
    default:
      return siteRoutes.prospectsCreate;
  }
}

export function prospectViewPath(module: ProspectModule, id: string): string {
  switch (module) {
    case "shop":
      return siteRoutes.shopProspectsView.replace(":id", id);
    case "design":
      return siteRoutes.designProspectsView.replace(":id", id);
    default:
      return siteRoutes.prospectsView.replace(":id", id);
  }
}

export function prospectEditPath(module: ProspectModule, id: string): string {
  switch (module) {
    case "shop":
      return siteRoutes.shopProspectsEdit.replace(":id", id);
    case "design":
      return siteRoutes.designProspectsEdit.replace(":id", id);
    default:
      return siteRoutes.prospectsEdit.replace(":id", id);
  }
}
