import API from "./api";
import { useAuthStore } from "../stores/authStore";

const getBusinessId = () => {
    const authStore = useAuthStore();
    return authStore.company?.id;
};

export const getAttendanceReport = (from, to) => {
    const businessId = getBusinessId();
    if (!businessId) return Promise.reject(new Error("Business ID not found"));
    return API.get(`/v1/admin/staff-attendance`, {
        params: {
            business_id: businessId,
            from,
            to,
        },
    });
};
