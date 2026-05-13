import axios from "axios";
import API from "./api";

export const login = (data) => API.post("/v1/user/login", data);
export const signup = async (data) => {
  const res = await API.post("/v1/user/register", data);
  return res.data;
};
export const getRegistrationMetaData = () => API.get("/v1/registration/meta");
export const logout = () => API.post("/v1/user/logout");
export const numberVerification = (data) =>
  API.post("/v1/user/verify-number", data);
export const forgotPassword = (data) =>
  API.post("/v1/user/forget-password", data);
export const resetPassword = (data) =>
  API.post("/v1/user/reset-password", data);
export const getBusinessCategories = () =>
  API.get("/v1/registration/business-categories");
export const saveBusinessDetails = async (data) => {
  const res = await API.post("/v1/user/business-details", data);
  return res.data;
};
export const userEmailVerification = (verifyUrl) => API.get(verifyUrl);
export const getProfile = () => API.get("/v1/user/profile");
export const updateProfile = (data) => API.put("/v1/user/profile", data);
export const changePassword = (data) => API.put("/v1/user/change-password", data);
export const getStates = (countryId) => API.get(`/v1/states/${countryId}`);
