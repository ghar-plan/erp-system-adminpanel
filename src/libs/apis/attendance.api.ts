import {
  deleteRequest,
  getRequest,
  postRequest,
} from "../../utils/helpers/common/http-methods";

export const Attendance_APIS = {
  checkIn: (body: { latitude: number; longitude: number }) =>
    postRequest("/v1/attendance/check-in", body),
  checkOut: (body: { latitude: number; longitude: number }) =>
    postRequest("/v1/attendance/check-out", body),
  getMine: (params: any = {}) => getRequest("/v1/attendance/me", params),
  getToday: () => getRequest("/v1/attendance/today"),
  getHistory: (params: any = {}) => getRequest("/v1/attendance/history", params),
  getAll: (params: any = {}) => getRequest("/v1/attendance", params),
  getById: (id: string) => getRequest(`/v1/attendance/${id}`),
  delete: (id: string) => deleteRequest(`/v1/attendance/${id}`),
};
