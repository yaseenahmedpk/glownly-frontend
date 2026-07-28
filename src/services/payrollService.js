import API from "./api";
import { useAuthStore } from "../stores/authStore";

const getBusinessId = () => {
    const authStore = useAuthStore();
    return authStore.company?.id;
};

export const getPayrollReport = (from, to) => {
    const businessId = getBusinessId();
    if (!businessId) return Promise.reject(new Error("Business ID not found"));
    return API.get(`/v1/admin/staff-payroll`, {
        params: {
            business_id: businessId,
            from,
            to,
        },
    });
};

export const getPayrollSummary = async (businessId, branchId, year, month) => {
    return API.get(`/v1/reports/payroll`, {
        params: {
            business_id: businessId,
            branch_id: branchId || null,
            year,
            month,
        },
    });
};

export const generatePayroll = async (payload) => {
    return API.post(`/v1/generate/payroll`, payload);
};
