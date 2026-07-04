// import useStore from "hooks/useStore";
// import React from "react";
// import { Navigate, Outlet, useLocation } from "react-router-dom";
// import { sitePermissions } from "utils/helpers/enums/permissions.enum";

// interface ProtectedRouteProps {
//   permission?: sitePermissions;
// }

// const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ permission }) => {
//   const { hasPermission } = useStore();
//   const location = useLocation();
//   const token = localStorage.getItem("token");
//   if (!token) {
//     return <Navigate to="/auth/login" replace />;
//   }
//   if (permission && !hasPermission(permission)) {
//     return <Navigate to="/404" state={{ from: location }} replace />;
//   }

//   return <Outlet />;
// };

// export default ProtectedRoute;
