import axios from "axios";
import API from "./api";

export const getRoles = (filter = {}) =>
  API.get("/v1/roles", {
    params: filter,
  });
export const storeRole = (data) => API.post("/v1/roles", data);
