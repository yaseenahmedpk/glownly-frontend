import axios from "axios";
import API from "./api";

export const getPermissions = (filter = {}) =>
  API.get("/v1/permissions", {
    params: filter,
  });
export const storePermission = (data) => API.post("/v1/permissions", data);
export const updatePermission = (id, data) => API.put(`/v1/permissions/${id}`, data);
export const deletePermission = (id) => API.delete(`/v1/permissions/${id}`);
