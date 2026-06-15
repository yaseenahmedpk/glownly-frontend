import API from "./api";

export const getServices = (filter = {}) =>
  API.get("/v1/services", {
    params: filter,
  });
export const storeService = (data) => API.post("/v1/services", data);
export const updateService = (id, data) => API.put(`/v1/services/${id}`, data);
export const deleteService = (id) => API.delete(`/v1/services/${id}`);