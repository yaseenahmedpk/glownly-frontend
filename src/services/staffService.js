import API from "./api";

export const getStaff = (businessId) => API.get(`/v1/staff/${businessId}`);
export const storeStaff = (data) => API.post("/v1/staff", data);
export const updateStaff = (id, data) => API.put(`/v1/staff/${id}`, data);
export const deleteStaff = (id) => API.delete(`/v1/staff/${id}`);
