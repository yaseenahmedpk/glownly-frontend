import axios from "axios";
import API from "./api";

export const getRoles = (filter = {}) =>
  API.get("/v1/roles", {
    params: filter,
  });
export const storeRole = (data) => API.post("/v1/roles", data);
export const updateRole = (id, data) => API.put(`/v1/roles/${id}`, data);
export const deleteRole = (id) => API.delete(`/v1/roles/${id}`);
export const gerRolePermissions = (roleId) =>
  API.get(`/v1/roles-permissions/${roleId}`);
export const storeRolePermissions = (data) => API.post("/v1/store-roles-permissions", data);
