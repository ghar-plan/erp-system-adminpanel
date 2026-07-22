import { Route, Routes } from "react-router-dom";
import MainLayout from "@/components/layouts/main-layout";
import Dashboard from "@/containers/main/dashboard";
import ProjectsListing from "@/containers/main/projects/listing";
import ProjectsCreate from "@/containers/main/projects/create";
import ProjectsView from "@/containers/main/projects/view";
import ProjectsEdit from "@/containers/main/projects/edit";
import VendorListing from "@/containers/main/vendors/list";
import VendorCreate from "@/containers/main/vendors/create";
import VendorEdit from "@/containers/main/vendors/edit";
import VendorView from "@/containers/main/vendors/view";
import Cashflow from "@/containers/main/cashflow";
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

const DashboardRoutes = () => {
  return (
    <MainLayout>
      <Routes>
        <Route path={siteRoutes.dashboard} element={<Dashboard />} />
        <Route path={siteRoutes.projects} element={<ProjectsListing />} />
        <Route path={siteRoutes.projectsCreate} element={<ProjectsCreate />} />
        <Route path={siteRoutes.projectsView} element={<ProjectsView />} />
        <Route path={siteRoutes.projectsEdit} element={<ProjectsEdit />} />
        <Route path={siteRoutes.reportsProjectList} element={<ProjectLedger />} />
        <Route path={siteRoutes.activity} element={<ActivitiesListing />} />
        <Route path={siteRoutes.activityCreate} element={<ActivityCreate />} />
        <Route path={siteRoutes.activityEdit} element={<ActivityEdit />} />
        <Route path={siteRoutes.vendors} element={<VendorListing />} />
        <Route path={siteRoutes.vendorsCreate} element={<VendorCreate />} />
        <Route path={siteRoutes.vendorsView} element={<VendorView />} />
        <Route path={siteRoutes.vendorsEdit} element={<VendorEdit />} />
        <Route path={siteRoutes.cashflow} element={<Cashflow />} />
        <Route path={siteRoutes.prospects} element={<ProspectsListing />} />
        <Route path={siteRoutes.prospectsCreate} element={<ProspectCreate />} />
        <Route path={siteRoutes.prospectsView} element={<ProspectView />} />
        <Route path={siteRoutes.prospectsEdit} element={<ProspectCreate />} />
        <Route path={siteRoutes.reportsVendorList} element={<Reports />} />
        <Route path={siteRoutes.profile} element={<MyProfile />} />
        <Route path={siteRoutes.contracts} element={<ContractsListing />} />
        <Route path={siteRoutes.contractsCreate} element={<ContractCreate />} />
        <Route path={siteRoutes.contractsEdit} element={<ContractEdit />} />
      </Routes>
    </MainLayout>
  );
};

export default DashboardRoutes;
