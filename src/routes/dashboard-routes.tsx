import { ReactElement } from "react";
import { Route, Routes } from "react-router-dom";
import MainLayout from "@/components/layouts/main-layout";
import Dashboard from "@/containers/main/dashboard";
import ProjectsListing from "@/containers/main/projects/listing";
import ProjectsCreate from "@/containers/main/projects/create";
import ProjectsView from "@/containers/main/projects/view";
import ProjectsEdit from "@/containers/main/projects/edit";
import Comments from "@/containers/main/comments";
import VendorListing from "@/containers/main/vendors/list";
import VendorCreate from "@/containers/main/vendors/create";
import VendorEdit from "@/containers/main/vendors/edit";
import VendorView from "@/containers/main/vendors/view";
import Cashflow from "@/containers/main/cashflow";
import CashflowView from "@/containers/main/cashflow/view";
import ActivitiesListing from "@/containers/main/activities/listing";
import ActivityCreate from "@/containers/main/activities/create";
import ActivityEdit from "@/containers/main/activities/edit";
import ProspectsListing from "@/containers/main/prospects/listing";
import ProspectCreate from "@/containers/main/prospects/create";
import ProspectView from "@/containers/main/prospects/view";
import { siteRoutes } from "@/utils/helpers/enums/routes.enum";
import Reports from "@/containers/main/reports/vendorList/listing";
import MyProfile from "@/containers/main/profile";
import ProjectLedger from "@/containers/main/reports/projectList/listing";
import ContractsListing from "@/containers/main/contracts/listing";
import ContractCreate from "@/containers/main/contracts/create";
import ContractEdit from "@/containers/main/contracts/edit";
import RolesListing from "@/containers/main/roles/listing";
import RoleEdit from "@/containers/main/roles/edit";
import UsersListing from "@/containers/main/users/listing";
import UsersCreate from "@/containers/main/users/create";
import PermissionsListing from "@/containers/main/permissions/listing";
import Unauthorized from "@/containers/main/unauthorized";
import PermissionGuard from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/utils/helpers/permissions/permission-constants";

function guard(
  element: ReactElement,
  permission?: string,
  permissions?: string[],
  mode: "any" | "all" = "any",
  explicit = false,
) {
  return (
    <PermissionGuard
      permission={permission}
      permissions={permissions}
      mode={mode}
      explicit={explicit}
    >
      {element}
    </PermissionGuard>
  );
}

const DashboardRoutes = () => {
  return (
    <MainLayout>
      <Routes>
        <Route
          path={siteRoutes.dashboard}
          element={guard(<Dashboard />, PERMISSIONS.DASHBOARD_READ)}
        />
        <Route
          path={siteRoutes.projects}
          element={guard(<ProjectsListing />, PERMISSIONS.CONSTRUCTION_SITE_READ)}
        />
        <Route
          path={siteRoutes.projectsCreate}
          element={guard(<ProjectsCreate />, PERMISSIONS.CONSTRUCTION_SITE_CREATE)}
        />
        <Route
          path={siteRoutes.projectsView}
          element={guard(<ProjectsView />, PERMISSIONS.CONSTRUCTION_SITE_READ)}
        />
        <Route
          path={siteRoutes.projectsEdit}
          element={guard(<ProjectsEdit />, PERMISSIONS.CONSTRUCTION_SITE_UPDATE)}
        />
        <Route
          path={siteRoutes.comments}
          element={guard(<Comments />, undefined, [
            PERMISSIONS.COMMENTS_READ,
            PERMISSIONS.CONSTRUCTION_SITE_READ,
          ])}
        />
        <Route
          path={siteRoutes.reportsProjectList}
          element={guard(<ProjectLedger />, PERMISSIONS.REPORTS_PROJECT_LIST)}
        />
        <Route
          path={siteRoutes.activity}
          element={guard(<ActivitiesListing />, PERMISSIONS.ACTIVITY_READ)}
        />
        <Route
          path={siteRoutes.activityCreate}
          element={guard(<ActivityCreate />, PERMISSIONS.ACTIVITY_CREATE)}
        />
        <Route
          path={siteRoutes.activityEdit}
          element={guard(<ActivityEdit />, PERMISSIONS.ACTIVITY_UPDATE)}
        />
        <Route
          path={siteRoutes.vendors}
          element={guard(<VendorListing />, PERMISSIONS.VENDORS_READ)}
        />
        <Route
          path={siteRoutes.vendorsCreate}
          element={guard(<VendorCreate />, PERMISSIONS.VENDORS_CREATE)}
        />
        <Route
          path={siteRoutes.vendorsView}
          element={guard(<VendorView />, PERMISSIONS.VENDORS_READ)}
        />
        <Route
          path={siteRoutes.vendorsEdit}
          element={guard(<VendorEdit />, PERMISSIONS.VENDORS_UPDATE)}
        />
        <Route
          path={siteRoutes.cashflow}
          element={guard(<Cashflow />, undefined, [
            PERMISSIONS.CASH_FLOW_READ,
            PERMISSIONS.CASH_FLOW_EXPORT,
            PERMISSIONS.CASH_FLOW_PRINT,
            PERMISSIONS.CASH_FLOW_IN,
            PERMISSIONS.CASH_FLOW_OUT,
            PERMISSIONS.CASH_FLOW_UPDATE,
            PERMISSIONS.CASH_FLOW_DELETE,
            PERMISSIONS.CASH_FLOW_IMPORT,
          ])}
        />
        <Route
          path={siteRoutes.cashflowView}
          element={guard(<CashflowView />, PERMISSIONS.CASH_FLOW_READ)}
        />
        <Route
          path={siteRoutes.prospects}
          element={guard(<ProspectsListing />, PERMISSIONS.PROSPECT_READ)}
        />
        <Route
          path={siteRoutes.prospectsCreate}
          element={guard(<ProspectCreate />, PERMISSIONS.PROSPECT_CREATE)}
        />
        <Route
          path={siteRoutes.prospectsView}
          element={guard(<ProspectView />, PERMISSIONS.PROSPECT_READ)}
        />
        <Route
          path={siteRoutes.prospectsEdit}
          element={guard(<ProspectCreate />, PERMISSIONS.PROSPECT_UPDATE)}
        />
        <Route
          path={siteRoutes.reportsVendorList}
          element={guard(<Reports />, PERMISSIONS.REPORTS_VENDOR_LIST)}
        />
        <Route path={siteRoutes.profile} element={<MyProfile />} />
        <Route
          path={siteRoutes.contracts}
          element={guard(<ContractsListing />, PERMISSIONS.CONTRACTS_READ)}
        />
        <Route
          path={siteRoutes.contractsCreate}
          element={guard(<ContractCreate />, PERMISSIONS.CONTRACTS_CREATE)}
        />
        <Route
          path={siteRoutes.contractsEdit}
          element={guard(<ContractEdit />, PERMISSIONS.CONTRACTS_UPDATE)}
        />
        <Route
          path={siteRoutes.roles}
          element={guard(<RolesListing />, PERMISSIONS.ROLES_READ)}
        />
        <Route
          path={siteRoutes.rolesCreate}
          element={guard(<RoleEdit />, PERMISSIONS.ROLES_CREATE)}
        />
        <Route
          path={siteRoutes.rolesEdit}
          element={guard(
            <RoleEdit />,
            undefined,
            [PERMISSIONS.ROLES_READ, PERMISSIONS.ROLES_UPDATE],
            "any",
          )}
        />
        <Route
          path={siteRoutes.users}
          element={guard(<UsersListing />, PERMISSIONS.USERS_READ)}
        />
        <Route
          path={siteRoutes.usersCreate}
          element={guard(<UsersCreate />, PERMISSIONS.USERS_CREATE)}
        />
        <Route
          path={siteRoutes.permissions}
          element={guard(<PermissionsListing />, PERMISSIONS.PERMISSIONS_READ)}
        />
        <Route path={siteRoutes.unauthorized} element={<Unauthorized />} />
      </Routes>
    </MainLayout>
  );
};

export default DashboardRoutes;
