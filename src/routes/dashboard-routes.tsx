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

const DashboardRoutes = () => {
  return (
    <MainLayout>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<ProjectsListing />} />
        <Route path="/projects/create" element={<ProjectsCreate />} />
        <Route path="/projects/view/:id" element={<ProjectsView />} />
        <Route path="/projects/edit/:id" element={<ProjectsEdit />} />
        <Route path="/activity" element={<ActivitiesListing />} />
        <Route path="/activity/create" element={<ActivityCreate />} />
        <Route path="/vendors" element={<VendorListing />} />
        <Route path="/vendors/create" element={<VendorCreate />} />
        <Route path="/vendors/view/:id" element={<VendorView />} />
        <Route path="/vendors/edit/:id" element={<VendorEdit />} />
        <Route path="/cashflow" element={<Cashflow />} />
        <Route
          path="/prospects"
          element={
            <div className="app-card">
              <h1 className="app-title mb-2">Prospects</h1>
              <p className="app-subtitle">
                Manage and track business prospects here.
              </p>
            </div>
          }
        />
        <Route
          path="/reports"
          element={
            <div className="app-card">
              <h1 className="app-title mb-2">Reports</h1>
              <p className="app-subtitle">
                Generate and view analytical reports here.
              </p>
            </div>
          }
        />
      </Routes>
    </MainLayout>
  );
};

export default DashboardRoutes;
