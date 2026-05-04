import axios from "axios";
import API from "./api";

export const getPermissions = (filter = {}) =>
  API.get("/v1/permissions", {
    params: filter,
  });
