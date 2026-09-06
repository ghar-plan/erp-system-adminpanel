import { useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";
import DashboardRoutes from "./dashboard-routes";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import Loader from "@/components/particles/loader";
import { siteRoutes } from "@/utils/helpers/enums/routes.enum";
import { Auth_APIS } from "@/libs/apis/auth.api";
import { normalizeAuthSession } from "@/utils/helpers/common/auth-mapper";
import {
  logout,
  saveUserData,
  setSessionStatus,
} from "@/store/slices/sharedSlice";
import type { AuthSession } from "@/utils/helpers/permissions/types";

function ProtectedApp() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.sharedReducer.token);
  const sessionStatus = useAppSelector(
    (state) => state.sharedReducer.sessionStatus,
  );
  const userData = useAppSelector(
    (state) => state.sharedReducer.userData as AuthSession | null,
  );
  const bootstrappedForToken = useRef<string | null>(null);

  useEffect(() => {
    if (!token) {
      bootstrappedForToken.current = null;
      return;
    }

    if (bootstrappedForToken.current === token) {
      return;
    }

    let cancelled = false;
    const soft = sessionStatus === "ready" && Boolean(userData?.id);

    (async () => {
      if (!soft) {
        dispatch(setSessionStatus("loading"));
      }
      try {
        const response = await Auth_APIS.getMe();
        if (cancelled) return;

        if (response?.error || response?.status === false || !response?.data) {
          dispatch(logout());
          return;
        }

        const session = normalizeAuthSession(response.data);
        if (!session.id) {
          dispatch(logout());
          return;
        }

        dispatch(saveUserData(session));
        dispatch(setSessionStatus("ready"));
        bootstrappedForToken.current = token;
      } catch {
        if (!cancelled) {
          dispatch(setSessionStatus("error"));
          dispatch(logout());
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, dispatch]);

  if (!token) {
    return <Navigate to={siteRoutes.login} replace />;
  }

  if (sessionStatus !== "ready") {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader />
      </div>
    );
  }

  return <DashboardRoutes />;
}

export default ProtectedApp;
