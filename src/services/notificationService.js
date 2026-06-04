import API from "./api";

export const getNotifications = (filter = {}) =>
  API.get("/v1/all-notifications", {
    params: filter,
  });
export const getSystemNotification = () => API.get("/v1/system-notifications");
export const storeNotification = (data) =>
  API.post("/v1/system-notifications", data);
export const updateNotification = (id, data) =>
  API.put(`/v1/notifications/${id}`, data);
export const deleteNotification = (id) => API.delete(`/v1/notifications/${id}`);
export const markAsRead = (id, type) =>
  API.post(`/v1/notifications/${id}/read`, { type });
export const markAllAsRead = () =>
  API.post("/v1/notifications/mark-all-read");
