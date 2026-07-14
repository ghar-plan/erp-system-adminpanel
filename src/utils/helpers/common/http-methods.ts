import axios from "./axios.config";
import { errorToaster } from "./alert-service";
import { errorMessages, warningMessages } from "../enums/messages.enum";

import { store } from "@/store";

const getHeaders = () => {
    // const token = localStorage.getItem("token");
  // const role = localStorage.getItem('role');
  const state = store.getState();
  const token = state.sharedReducer.token;
  const headers: any = {
    Authorization: `Bearer ${token}`,
    accept: "*/*",
  };
  return headers;
};

export const postRequest = async (url: string, data: any, params: any = {}) => {
  try {
    const headers = getHeaders();
    const response: any = await axios.post(url, data, { params, headers });
    return response.data;
  } catch (error) {
    return errorHandler(error);
  }
};

export const getRequest = async (url: string, params: any = {}) => {
  try {
    const headers = getHeaders();
    const response: any = await axios.get(url, { params, headers });
    console.log(response.data)
    if(response.data?.data?.pendrequstsCount){
      localStorage.setItem('pendrequstsCount', response?.data?.data?.pendrequstsCount)
    }
    return response.data;
  } catch (error) {
    return errorHandler(error);
  }
};

export const putRequest = async (url: string, data: any, params: any = {}) => {
  try {
    const headers = getHeaders();
    const response: any = await axios.put(url, data, { params, headers });
    return response.data;
  } catch (error) {
    return errorHandler(error);
  }
};

export const patchRequest = async (
  url: string,
  data: any,
  params: any = {}
) => {
  try {
    const headers = getHeaders();
    const response: any = await axios.patch(url, data, { params, headers });
    return response.data;
  } catch (error) {
    return errorHandler(error);
  }
};

export const deleteRequest: any = async (url: string, params: any = {}) => {
  try {
    const headers = getHeaders();
    const response = await axios.delete(url, { params, headers });
    return response?.data;
  } catch (error) {
    console.log(url, "url");
    return errorHandler(error);
  }
};

const errorHandler = (error: any) => {
  let message = "";
  if (error.response) {
    const status = error.response.status;
    const responseData = error.response.data;

    if (status === 401) {
      const isLoginRequest = error.config?.url?.includes("/login") || error.config?.url?.includes("/auth/login");
      if (isLoginRequest) {
        const errorMsg = responseData?.message || responseData?.error || "Invalid email or password";
        errorToaster(errorMsg);
        message = errorMsg;
      } else {
        errorToaster(warningMessages.sessionExpired);
        localStorage.clear();
        message = warningMessages.sessionExpired;
      }
    } else {
      const errorMsg = responseData?.message || responseData?.error || errorMessages.somethingWentWrong;
      if (Array.isArray(errorMsg)) {
        errorMsg.forEach((msg: any) => {
          errorToaster(typeof msg === "string" ? msg : JSON.stringify(msg));
        });
        message = errorMsg.join(", ");
      } else {
        const singleMsg = typeof errorMsg === "string" ? errorMsg : errorMessages.somethingWentWrong;
        errorToaster(singleMsg);
        message = singleMsg;
      }
    }
  } else if (error?.message) {
    message = error.message;
    errorToaster(message);
  } else {
    message = errorMessages.somethingWentWrong;
    errorToaster(message);
  }

  return { error: message };
};

export const getFilePathWithBackendUrl = (path: any): string => {
  if (typeof path !== "string" || !path) {
    return "";
  }

  if (path.includes("http") || path.startsWith("blob:")) {
    return path;
  }

  const prefix = import.meta.env.VITE_BASE_URL_PREFIX || "";
  const cleanPrefix = prefix.endsWith("/") ? prefix.slice(0, -1) : prefix;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return `${cleanPrefix}${cleanPath}`;
};


