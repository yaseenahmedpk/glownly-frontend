import axios from "axios";
import API from "./api";

export const getSystemNotifications = (filter = {}) =>
  API.get("/v1/system-notifications", {
    params: filter,
  });
export const storeSystemNotification = (data) => API.post("/v1/system-notifications", data);
export const updateSystemNotification = (id, data) => API.put(`/v1/system-notifications/${id}`, data);
export const deleteSystemNotification = (id) => API.delete(`/v1/system-notifications/${id}`);