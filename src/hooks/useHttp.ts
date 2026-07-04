import axios from "../utils/helpers/common/axios.config";
import useStore from "./useStore";
import { errorToaster } from "../utils/helpers/common/alert-service";
import { errorMessages } from "../utils/helpers/enums/messages.enum";

const useHttp = () => {
  const { logout, setLoading } = useStore();

  const isPreventLoaderAPI = (apiUrl: string): boolean => {
    if (!apiUrl) return false;

    // Remove query parameters
    let path = apiUrl.split("?")[0];

    // Handle full URL (in case baseURL is not set or URL is absolute)
    if (path.startsWith("http://") || path.startsWith("https://")) {
      try {
        const urlObj = new URL(path);
        path = urlObj.pathname;
      } catch (e) {
        // If URL parsing fails, try to extract path manually
        const match = path.match(/https?:\/\/[^\/]+(\/.*)/);
        if (match) {
          path = match[1];
        }
      }
    }

    // Remove base URL if present (in case it's included)
    const baseUrl = import.meta.env.VITE_BASE_URL_PREFIX || "";
    if (baseUrl && path.includes(baseUrl)) {
      path = path.substring(path.indexOf(baseUrl) + baseUrl.length);
    }

    // Ensure path starts with /
    if (!path.startsWith("/")) {
      path = "/" + path;
    }

    const stopLoaderAPIs = [/^\/v1\/media\/upload$/];

    const matches = stopLoaderAPIs.some((regex) => regex.test(path));

    return matches;
  };

  function configureHeaders() {
    axios.interceptors.request.use(
      (config: any) => {
        const url = config.url || "";
        const shouldPreventLoader = isPreventLoaderAPI(url);

        if (!shouldPreventLoader) {
          setLoading(true);
          config._shouldShowLoader = true;
        } else {
          config._shouldShowLoader = false;
        }
        return config;
      },
      (error) => {
        // Promise.reject(error)
      },
    );
  }

  const configureInterceptors = () => {
    axios.interceptors.response.use(
      (response: any) => {
        // Only hide loader if it was explicitly shown for this request
        // If _shouldShowLoader is undefined, it means the request interceptor didn't run,
        // so we should hide the loader to be safe (backward compatibility)
        if (response?.config?._shouldShowLoader === true) {
          setLoading(false);
        } else if (response?.config?._shouldShowLoader === undefined) {
          // Fallback: if flag is not set, hide loader (for backward compatibility)
          setLoading(false);
        }
        if (response?.data?.status === false || response?.data?.status == 0)
          displayApiErrors(response);
        return response;
      },
      async (error) => {
        // Only hide loader if it was explicitly shown for this request
        // If _shouldShowLoader is undefined, hide loader to be safe
        if (error?.config?._shouldShowLoader === true) {
          setLoading(false);
        } else if (error?.config?._shouldShowLoader === undefined) {
          // Fallback: if flag is not set, hide loader (for backward compatibility)
          setLoading(false);
        }
        if (error?.response?.status === 401) {
          logout();
        }
        return Promise.reject(error);
      },
    );
  };

  const displayApiErrors = (response: any) => {
    errorToaster(
      response?.data?.errors?.length &&
        typeof response?.data?.errors === "object"
        ? response?.data?.errors[0]
        : response?.data?.message?.length
          ? response?.data?.message
          : response?.data?.error?.length
            ? response?.data?.error
            : errorMessages.somethingWentWrong,
    );
  };

  return {
    configureHeaders,
    configureInterceptors,
  };
};

export default useHttp;
