import { Attendance_APIS } from "@/libs/apis/attendance.api";
import {
  confirmationPopup,
  errorToaster,
  successToaster,
} from "@/utils/helpers/common/alert-service";

export function requestCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Location services are not available on this device."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          reject(
            new Error(
              "Location permission is required to mark attendance. Please allow location access in your browser.",
            ),
          );
          return;
        }
        if (error.code === error.POSITION_UNAVAILABLE) {
          reject(
            new Error(
              "Unable to determine your location. Enable location services and try again.",
            ),
          );
          return;
        }
        reject(new Error("Location request timed out. Please try again."));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  });
}

const useAttendance = () => {
  const markCheckIn = async () => {
    try {
      const coords = await requestCurrentLocation();
      const response = await Attendance_APIS.checkIn(coords);
      if (response?.status) {
        successToaster(response.message || "Checked in successfully");
        return response.data;
      }
      if (!response?.toasted) {
        errorToaster(response?.message || "Failed to check in");
      }
    } catch (error: any) {
      errorToaster(error?.message || "Location permission is required to mark attendance.");
    }
    return null;
  };

  const markCheckOut = async () => {
    try {
      const coords = await requestCurrentLocation();
      const response = await Attendance_APIS.checkOut(coords);
      if (response?.status) {
        successToaster(response.message || "Checked out successfully");
        return response.data;
      }
      if (!response?.toasted) {
        errorToaster(response?.message || "Failed to check out");
      }
    } catch (error: any) {
      errorToaster(error?.message || "Location permission is required to mark attendance.");
    }
    return null;
  };

  const getToday = async (setData: Function) => {
    const response = await Attendance_APIS.getToday();
    if (response?.status) {
      setData(response.data || null);
    } else {
      setData(null);
    }
  };

  const getMyAttendance = async (
    setData: Function,
    queryParams: any = {},
    setTotalElements?: Function,
  ) => {
    const response = await Attendance_APIS.getHistory(queryParams);
    if (response?.status && response.data) {
      setData(response.data);
      setTotalElements?.(response.total || response.data.length);
    } else {
      setData([]);
      setTotalElements?.(0);
    }
  };

  const getAllAttendance = async (
    setData: Function,
    queryParams: any = {},
    setTotalElements?: Function,
  ) => {
    const response = await Attendance_APIS.getAll(queryParams);
    if (response?.status && response.data) {
      setData(response.data);
      setTotalElements?.(response.total || response.data.length);
    } else {
      setData([]);
      setTotalElements?.(0);
    }
  };

  const deleteAttendance = async (id: string, callback?: Function) => {
    const result = await confirmationPopup(
      "Delete attendance",
      "This attendance record will be removed.",
    );
    if (!result.isConfirmed) return false;
    const response = await Attendance_APIS.delete(id);
    if (response?.status) {
      successToaster(response.message || "Attendance deleted successfully");
      callback?.();
      return true;
    }
    if (!response?.toasted) {
      errorToaster(response?.message || "Failed to delete attendance");
    }
    return false;
  };

  return {
    markCheckIn,
    markCheckOut,
    getToday,
    getMyAttendance,
    getAllAttendance,
    deleteAttendance,
  };
};

export default useAttendance;
