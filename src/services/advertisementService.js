import API from "./api";

export const getAdvertisements = (filter = {}) =>
  API.get("/v1/advertisements", {
    params: filter,
  });

export const getAdvertisement = (id) =>
  API.get(`/v1/advertisements/${id}`);

export const storeAdvertisement = (data) => {
  if (data instanceof FormData) {
    return API.post("/v1/advertisements", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
  return API.post("/v1/advertisements", data);
};

export const updateAdvertisement = (id, data) => {
  if (data instanceof FormData) {
    data.append("_method", "PUT");
    return API.post(`/v1/advertisements/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
  return API.put(`/v1/advertisements/${id}`, data);
};

export const deleteAdvertisement = (id) =>
  API.delete(`/v1/advertisements/${id}`);

export const updateAdvertisementStatus = (id, status) =>
  API.patch(`/v1/advertisements/${id}/status`, { status });
