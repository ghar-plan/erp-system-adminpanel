const useUtils = () => {
  const getFilePathWithBackendUrl = (path: any): string => {
    if (typeof path !== "string") {
      return "";
    }

    if (path.includes("http")) {
      return path;
    } else {
      return import.meta.env.VITE_BASE_URL_PREFIX + "/uploads/" + path;
    }
  };

  const createQuery = (params: any = {}): string => {
    let query = "";
    let i = 0;
    for (let key in params) {
      query += `${i === 0 ? "?" : "&"}${key}=${params[key]}`;
      i++;
    }

    return query;
  };

  const getAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    return age;
  }

  const getQueryParams: any = () => {
    return window.location.search
      .replace(/^\?/, "")
      .split("&")
      .reduce((obj, str) => {
        if (!str) return obj;
        const pair = str.split("=");
        return { ...obj, [pair[0]]: pair[1] };
      }, {});
  };

  const getDateTime = (dateString: string) => {
    if(dateString){
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        month: "long",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }else{
      return dateString;
    }
  }

  return {
    getFilePathWithBackendUrl,
    createQuery,
    getAge,
    getQueryParams,
    getDateTime
  }
}

export default useUtils;