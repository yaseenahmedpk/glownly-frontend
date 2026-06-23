import API from "./api";

export const getBusinesses = (filter = {}) =>
  API.get("/v1/businesses", {
    params: filter,
  });

export const getBusiness = (id) => API.get(`/v1/businesses/${id}`);

export const storeBusiness = (data) => API.post("/v1/businesses", data);

export const updateBusiness = (id, data) => API.put(`/v1/businesses/${id}`, data);

export const deleteBusiness = (id) => API.delete(`/v1/businesses/${id}`);