import { Routes, Route, Navigate } from "react-router-dom";
import AuthRoutes from "./auth-routes";
import DashboardRoutes from "./dashboard-routes";
import { useAppSelector } from "@/store/hooks";
import Loader from "@/components/particles/loader";

const AppRoutes = () => {
  const { isLoading, token } = useAppSelector((state) => state.sharedReducer);

  return (
    <>
      {isLoading && <Loader />}
      <Routes>
        <Route
          path="/"
          element={
            token ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/auth/login" replace />
            )
          }
        />
        <Route
          path="/auth/*"
          element={
            !token ? (
              <AuthRoutes />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />
        <Route
          path="/*"
          element={
            token ? (
              <DashboardRoutes />
            ) : (
              <Navigate to="/auth/login" replace />
            )
          }
        />
      </Routes>
    </>
  );
};

export default AppRoutes;
