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

export const getAttendanceSummary = async (from, to) => {
    const response = await getAttendanceReport(from, to);
    const payload = response.data.data || response.data || {};
    const records = Array.isArray(payload.records) ? payload.records : [];

    const stats = payload.stats || {};

    const mtdData = stats.mtd || {
        present: 0,
        absent: 0,
        leave: 0,
    };

    const weeklyData = Array.isArray(stats.weekly) ? stats.weekly : [];

    return {
        records,
        totalStaff: stats.total_staff || 0,
        mtdData,
        weeklyData,
    };
};
