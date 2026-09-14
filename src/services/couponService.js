import API from "./api";
import { useAuthStore } from "../stores/authStore";

const getBusinessId = () => {
  const authStore = useAuthStore();
  return authStore.company?.id;
};

export const getCoupons = (filter = {}) => {
  const businessId = getBusinessId();
  return API.get(`/v1/coupons/${businessId}`, {
    params: filter,
  });
};

export const getCoupon = (id) =>
  API.get(`/v1/coupons/${id}`);

export const storeCoupon = (data) =>
  API.post("/v1/coupons", data);

export const updateCoupon = (id, data) =>
  API.put(`/v1/coupons/${id}`, data);

export const deleteCoupon = (id) =>
  API.delete(`/v1/coupons/${id}`);

export const updateCouponStatus = (id, status) =>
  API.patch(`/v1/coupons/${id}/status`, { status });

export const getCouponSettings = () =>
  API.get("/v1/coupon-settings");

export const updateCouponSettings = (data) =>
  API.put("/v1/coupon-settings", data);

export const regenerateCouponQrCode = (couponId) =>
  API.put(`/v1/coupons/${couponId}/regenerate-qr-code`);
