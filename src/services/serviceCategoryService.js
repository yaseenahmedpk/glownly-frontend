import API from "./api";

export const getServiceCategories = (filter = {}) =>
  API.get("/v1/service-categories", {
    params: filter,
  });
export const storeServiceCategory = (data) => API.post("/v1/service-categories", data);
export const updateServiceCategory = (id, data) => API.put(`/v1/service-categories/${id}`, data);
export const deleteServiceCategory = (id) => API.delete(`/v1/service-categories/${id}`);