import API from "./api";

export const getServices = (filter = {}) =>
  API.get("/v1/services", {
    params: filter,
  });

export const storeService = (data) => {
  if (data instanceof FormData) {
    return API.post("/v1/services", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
  return API.post("/v1/services", data);
};

export const updateService = (id, data) => {
  if (data instanceof FormData) {
    data.append("_method", "PUT");
    return API.post(`/v1/services/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
  const formData = new FormData();
  formData.append("business_id", data.business_id);
  formData.append("service_category_id", data.service_category_id);
  formData.append("name", data.name);
  formData.append("duration_minutes", data.duration_minutes || "");
  formData.append("is_active", data.is_active || false);
  if (data.image) {
    formData.append("image", data.image);
  }
  formData.append("_method", "PUT");
  return API.post(`/v1/services/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteService = (id) => API.delete(`/v1/services/${id}`);