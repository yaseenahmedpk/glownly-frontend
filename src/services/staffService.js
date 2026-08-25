import API from "./api";

export const getStaff = (businessId) => API.get(`/v1/staff/${businessId}`);
export const storeStaff = (data) => API.post("/v1/staff", data);
export const updateStaff = (id, data) => {
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    if (Array.isArray(data[key])) {
      data[key].forEach((item) => formData.append(`${key}[]`, item));
    } else {
      formData.append(key, data[key]);
    }
  });
  formData.append("_method", "PUT");
  return API.post(`/v1/staff/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
export const deleteStaff = (id) => API.delete(`/v1/staff/${id}`);
