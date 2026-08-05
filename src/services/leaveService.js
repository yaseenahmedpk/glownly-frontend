import API from "./api";
import { useAuthStore } from "../stores/authStore";

const getBusinessId = () => {
  const authStore = useAuthStore();
  return authStore.company?.id;
};

export function getCalendarEvents(params = {}) {
  const businessId = getBusinessId();
  if (!businessId) return Promise.reject(new Error("Business ID not found"));
  return API.get("/v1/settings/calendar-events", {
    params: { business_id: businessId, ...params },
  });
}

export function getLeaveDetails(leaveId) {
  const businessId = getBusinessId();
  if (!businessId) return Promise.reject(new Error("Business ID not found"));
  return API.get(`/v1/admin/staff-leaves/${leaveId}`, {
    params: { business_id: businessId },
  });
}

export function getHolidayDetails(holidayId) {
  const businessId = getBusinessId();
  if (!businessId) return Promise.reject(new Error("Business ID not found"));
  return API.get(`/v1/admin/holidays/${holidayId}`, {
    params: { business_id: businessId },
  });
}
