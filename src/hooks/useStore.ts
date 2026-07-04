import { useNavigate } from "react-router-dom";
import { siteRoutes } from "@/utils/helpers/enums/routes.enum";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  setLoading as setLoadingAction,
  saveToken as saveTokenAction,
  saveUserData as saveUserDataAction,
  setExpandSidebar as setExpandSidebarAction,
  logout as logoutAction,
} from "../store/slices/sharedSlice";

const useStore = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { token, userData: user, isLoading } = useAppSelector((state) => state.sharedReducer);

  const setLoading = (isLoading: boolean): void => {
    dispatch(setLoadingAction(isLoading));
  };

  const setToken = (payload: null | string): void => {
    dispatch(saveTokenAction(payload));
  };

  const userData = (payload: any): void => {
    dispatch(saveUserDataAction(payload));
  };

  const getUser = () => {
    return user;
  };

  const getToken = (): string | null => {
    return token;
  };

  const logout = () => {
    dispatch(logoutAction());
    navigate(siteRoutes.login);
  };

  const setExpandSidebar = (isExpanded: boolean): void => {
    dispatch(setExpandSidebarAction(isExpanded));
  };

  return {
    setToken,
    setLoading,
    logout,
    getToken,
    getUser,
    setExpandSidebar,
    userData,
    isLoading, // Exporting isLoading directly as well just in case
  };
};

export default useStore;
