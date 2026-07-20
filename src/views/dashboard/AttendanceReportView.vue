<script setup>
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "../../stores/authStore";
import { getStaff } from "../../services/staffService";
import { getAttendanceReport } from "../../services/attendanceService";
import { handleApiError } from "../../helpers/handleApiError";
import { showErrorAlert } from "../../helpers/swal";
import { useToast } from "../../helpers/useToast";
import Vue3EasyDataTable from "vue3-easy-data-table";
import "vue3-easy-data-table/dist/style.css";
import { VueDatePicker } from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";

const { t } = useI18n();
const { toast } = useToast();
const authStore = useAuthStore();

const loading = ref(false);
const attendanceData = ref([]);
const allStaff = ref([]);
const totalStaffCount = ref(0);

const fromDate = ref(null);
const toDate = ref(null);

const currentMonthStart = computed(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
});

const today = computed(() => new Date());

const monthStats = ref({
    totalStaff: 0,
    presentStaff: 0,
    absentStaff: 0,
    attendancePercentage: 0,
});

const tableHeaders = [
    { text: t("sr_no"), value: "sr_no" },
    { text: t("staff_name"), value: "staff_name" },
    { text: t("check_in"), value: "check_in" },
    { text: t("check_out"), value: "check_out" },
];

const tableItems = computed(() => {
    return attendanceData.value.map((item, index) => ({
        sr_no: index + 1,
        staff_name: item.staff_full_name,
        profile_pic: item.staff_profile_pic,
        check_in: item.check_in_time
            ? `${item.attendance_date} ${item.check_in_time}`
            : "-",
        check_out: item.check_out_time
            ? `${item.attendance_date} ${item.check_out_time}`
            : "-",
    }));
});

const fetchStaffCount = async () => {
    try {
        const businessId = authStore.company?.id;
        if (!businessId) return;
        const response = await getStaff(businessId);
        const staff = response.data.staff || response.data || [];
        allStaff.value = Array.isArray(staff) ? staff : [];
        totalStaffCount.value = allStaff.value.length;
    } catch (error) {
        showErrorAlert(handleApiError(error, t));
    }
};

const fetchCurrentMonthStats = async () => {
    try {
        loading.value = true;
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const firstDay = `${year}-${String(month + 1).padStart(2, "0")}-01`;
        const lastDay = now.toISOString().split("T")[0];

        const response = await getAttendanceReport(firstDay, lastDay);
        const data = response.data.data || response.data || [];
        const records = Array.isArray(data) ? data : [];

        const uniquePresentStaff = new Set();
        const uniqueAbsentStaff = new Set();

        records.forEach((record) => {
            const status = (record.status || "").toLowerCase();
            if (status === "present" || status === "late" || status === "half_day") {
                uniquePresentStaff.add(record.staff_member_id);
            } else if (status === "absent" || status === "missing") {
                uniqueAbsentStaff.add(record.staff_member_id);
            }
        });

        const presentCount = uniquePresentStaff.size;
        const absentCount = uniqueAbsentStaff.size;
        const totalCount = totalStaffCount.value;

        monthStats.value = {
            totalStaff: totalCount,
            presentStaff: presentCount,
            absentStaff: absentCount,
            attendancePercentage:
                totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0,
        };
    } catch (error) {
        showErrorAlert(handleApiError(error, t));
    } finally {
        loading.value = false;
    }
};

const generateReport = async () => {
    if (!fromDate.value || !toDate.value) {
        showErrorAlert(t("select_date_range") || "Please select a date range");
        return;
    }

    try {
        loading.value = true;
        const from = fromDate.value.toISOString().split("T")[0];
        const to = toDate.value.toISOString().split("T")[0];

        const response = await getAttendanceReport(from, to);
        const data = response.data.data || response.data || [];
        attendanceData.value = Array.isArray(data) ? data : [];
    } catch (error) {
        showErrorAlert(handleApiError(error, t));
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchStaffCount();
    fetchCurrentMonthStats();
});
</script>

<template>
    <div class="attendance-report-view">
        <div class="row align-items-center mb-4">
            <div class="col-lg-6 col-md-6">
                <h3 class="page-title">{{ $t("attendance_report") }}</h3>
            </div>
        </div>

        <div class="row mb-4">
                    <div class="col-md-4 col-sm-6 mb-3">
                <div class="stat-card stat-card-total">
                    <div class="stat-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div class="stat-info">
                        <span class="stat-label">{{ $t("total_staff") }}</span>
                        <span class="stat-value">{{ monthStats.totalStaff }}</span>
                    </div>
                </div>
            </div>
            <div class="col-md-4 col-sm-6 mb-3">
                <div class="stat-card stat-card-present">
                    <div class="stat-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div class="stat-info">
                        <span class="stat-label">{{ $t("present_staff") }}</span>
                        <span class="stat-value">{{ monthStats.presentStaff }}</span>
                    </div>
                </div>
            </div>
            <div class="col-md-4 col-sm-6 mb-3">
                <div class="stat-card stat-card-absent">
                    <div class="stat-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0Z" />
                        </svg>
                    </div>
                    <div class="stat-info">
                        <span class="stat-label">{{ $t("absent_staff") }}</span>
                        <span class="stat-value">{{ monthStats.absentStaff }}</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="row mb-4">
            <div class="col-12">
                <div class="card filter-card">
                    <div class="card-body">
                        <div class="row align-items-end g-3">
                            <div class="col-md-4">
                                <label class="form-label fw-semibold">{{ $t("from_date") }}</label>
                                <VueDatePicker
                                    v-model="fromDate"
                                    :placeholder="$t('from_date')"
                                    format="yyyy-MM-dd"
                                    :enable-time-picker="false"
                                    :clearable="false"
                                />
                            </div>
                            <div class="col-md-4">
                                <label class="form-label fw-semibold">{{ $t("to_date") }}</label>
                                <VueDatePicker
                                    v-model="toDate"
                                    :placeholder="$t('to_date')"
                                    format="yyyy-MM-dd"
                                    :enable-time-picker="false"
                                    :clearable="false"
                                />
                            </div>
                            <div class="col-md-4">
                                <button
                                    class="btn btn-primary btn-generate"
                                    :disabled="loading"
                                    @click="generateReport"
                                >
                                    <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    {{ loading ? t("processing") : t("generate_report") }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <div class="header-title">
                            <h4 class="card-title">{{ $t("attendance_report") }}</h4>
                        </div>
                    </div>
                    <div class="card-body">
                        <Vue3EasyDataTable
                            v-if="tableItems.length > 0"
                            :headers="tableHeaders"
                            :items="tableItems"
                            :loading="loading"
                            :rows-per-page="10"
                            :pagination-info="{ text: t('no_data') }"
                        >
                            <template #item-staff_name="item">
                                <div class="d-flex align-items-center gap-2">
                                    <img
                                        :src="item.profile_pic || '/default-avatar.png'"
                                        class="avatar-sm rounded-circle"
                                        :alt="item.staff_name"
                                        @error="$event.target.src = '/default-avatar.png'"
                                    />
                                    <span class="fw-semibold">{{ item.staff_name }}</span>
                                </div>
                            </template>
                            <template #item-check_in="item">
                                <span class="fw-semibold text-success">{{ item.check_in }}</span>
                            </template>
                            <template #item-check_out="item">
                                <span :class="item.check_out !== '-' ? 'text-muted' : 'text-danger'">
                                    {{ item.check_out }}
                                </span>
                            </template>
                        </Vue3EasyDataTable>

                        <div v-else-if="!loading" class="text-center py-5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" fill="none" viewBox="0 0 24 24" stroke="#D1D5DB">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-3.75h7.5m-7.5 0V19.5" />
                            </svg>
                            <p class="text-muted mt-3">{{ $t("no_attendance_data") }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.page-title {
    color: #1a1a2e;
    font-weight: 700;
    font-size: 26px;
    margin: 0;
}

.stat-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px 24px;
    border-radius: 16px;
    border: 1px solid #e5e7eb;
    background: #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    transition: all 0.2s ease;
}

.stat-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
    transform: translateY(-2px);
}

.stat-card-total {
    border-left: 4px solid #6b7280;
}

.stat-card-present {
    border-left: 4px solid #10b981;
}

.stat-card-absent {
    border-left: 4px solid #ef4444;
}

.stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.stat-card-total .stat-icon {
    background: rgba(107, 114, 128, 0.1);
    color: #6b7280;
}

.stat-card-present .stat-icon {
    background: rgba(16, 185, 129, 0.1);
    color: #10b981;
}

.stat-card-absent .stat-icon {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
}

.stat-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.stat-label {
    font-size: 13px;
    color: #6b7280;
    font-weight: 500;
}

.stat-value {
    font-size: 24px;
    font-weight: 700;
    color: #1a1a2e;
}

.filter-card {
    border-radius: 14px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.form-label {
    font-weight: 600;
    font-size: 13px;
    color: #374151;
    margin-bottom: 6px;
}

.btn-generate {
    width: 100%;
    padding: 10px 22px;
    border-radius: 10px;
    font-weight: 600;
    font-size: 14px;
    background: #9a77bc;
    border: none;
    color: #fff;
    box-shadow: 0 2px 8px rgba(154, 119, 188, 0.3);
    transition: all 0.2s ease;
}

.btn-generate:hover:not(:disabled) {
    background: #8a69ac;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(154, 119, 188, 0.4);
    color: #fff;
}

.btn-generate:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

.avatar-sm {
    width: 36px;
    height: 36px;
    object-fit: cover;
    border: 1px solid #e5e7eb;
}

:deep(.easy-data-table) {
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid #e5e7eb;
}

:deep(.easy-data-table th) {
    background: #f8f9fb !important;
    color: #374151 !important;
    font-weight: 600 !important;
    font-size: 13px !important;
    text-transform: uppercase;
    letter-spacing: 0.3px;
}

:deep(.easy-data-table td) {
    font-size: 14px !important;
    color: #1a1a2e !important;
}

:deep(.vue-date-picker) {
    --dp-input-padding: 10px 14px;
    --dp-border-radius: 10px;
    border-radius: 10px;
    width: 100%;
}

:deep(.dp__input) {
    border: 1.5px solid #e5e7eb !important;
    border-radius: 10px !important;
    font-size: 14px !important;
    color: #1a1a2e !important;
    min-height: 42px !important;
}

:deep(.dp__input:focus) {
    border-color: #9a77bc !important;
    box-shadow: 0 0 0 3px rgba(154, 119, 188, 0.15) !important;
}

:deep(.dp__menu) {
    border-radius: 12px !important;
    border: 1px solid #e5e7eb !important;
}

@media (max-width: 768px) {
    .stat-card {
        padding: 16px 18px;
        gap: 12px;
    }

    .stat-value {
        font-size: 20px;
    }

    .stat-icon {
        width: 40px;
        height: 40px;
    }
}
</style>
