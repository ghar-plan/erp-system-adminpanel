import { Routes, Route, Navigate } from "react-router-dom";
import AuthRoutes from "./auth-routes";
import ProtectedApp from "./ProtectedApp";
import { useAppSelector } from "@/store/hooks";
import Loader from "@/components/particles/loader";
import { usePermissions } from "@/hooks/usePermissions";
import { firstAllowedPath } from "@/navigation/menu.config";

const AppRoutes = () => {
  const { isLoading, token } = useAppSelector((state) => state.sharedReducer);
  const { hasPermission, hasAnyPermission, hasExplicitPermission, isSessionReady } =
    usePermissions();
  const homePath =
    token && isSessionReady
      ? firstAllowedPath(hasPermission, hasAnyPermission, hasExplicitPermission)
      : "/dashboard";

  return (
    <>
      {isLoading && <Loader />}
      <Routes>
        <Route
          path="/"
          element={
            token ? (
              <Navigate to={homePath} replace />
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
              <Navigate to={homePath} replace />
            )
          }
        />
        <Route
          path="/*"
          element={
            token ? (
              <ProtectedApp />
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
