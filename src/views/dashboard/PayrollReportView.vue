<script setup>
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { getStaff } from "../../services/staffService";
import { useAuthStore } from "../../stores/authStore";
import { getPayrollSummary, generatePayroll } from "../../services/payrollService";
import { getProfile } from "../../services/authService";
import { handleApiError } from "../../helpers/handleApiError";
import { showErrorAlert, showSuccessAlert } from "../../helpers/swal";
import { useToast } from "../../helpers/useToast";
import Vue3EasyDataTable from "vue3-easy-data-table";
import "vue3-easy-data-table/dist/style.css";
import { VueDatePicker } from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import defaultProfilePic from "../../assets/images/profile.png";
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from "chart.js";
import { Bar } from "vue-chartjs";
import Swal from "sweetalert2";

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const { t } = useI18n();
const { toast } = useToast();
const authStore = useAuthStore();

const loading = ref(false);
const payrollData = ref([]);
const allStaff = ref([]);
const totalStaffCount = ref(0);
const currencySymbol = ref("");

const selectedMonth = ref(new Date().getMonth() + 1);
const selectedYear = ref(new Date().getFullYear());

const summaryStats = ref({
    totalSalary: 0,
    totalDeductions: 0,
    netSalary: 0,
});

const chartData = ref([]);

const currentMonthStart = computed(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
});

const today = computed(() => new Date());

const tableHeaders = [
    { text: t("sr_no"), value: "sr_no" },
    { text: t("staff_name"), value: "staff_name" },
    { text: "Basic Salary", value: "basic_salary" },
    { text: "Allowance", value: "allowance" },
    { text: "Bonus", value: "bonus" },
    { text: "Deduction", value: "deduction" },
    { text: "Net Salary", value: "net_salary" },
    { text: "Present Days", value: "present_days" },
];

const tableItems = computed(() => {
    return payrollData.value.map((item, index) => ({
        sr_no: index + 1,
        staff_name: item.full_name,
        profile_pic: item.profile_pic,
        basic_salary: formatAmount(item.basic_salary),
        allowance: formatAmount(item.allowance),
        bonus: formatAmount(item.bonus),
        deduction: formatAmount(item.deduction),
        net_salary: formatAmount(item.net_salary),
        present_days: item.present_days,
    }));
});

const barChartData = computed(() => {
    const labels = chartData.value.map((item) => item.full_name);
    const salary = chartData.value.map((item) => item.basic_salary || 0);
    const deductions = chartData.value.map((item) => parseFloat(item.deduction || 0));
    const netSalary = chartData.value.map((item) => item.net_salary || 0);

    return {
        labels,
        datasets: [
            {
                label: t("net_salary"),
                data: netSalary,
                backgroundColor: "#10b981",
                borderRadius: 4,
                barPercentage: 0.6,
            },
            {
                label: t("deductions"),
                data: deductions,
                backgroundColor: "#ef4444",
                borderRadius: 4,
                barPercentage: 0.6,
            },
        ],
    };
});

const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: "top",
            align: "end",
            labels: {
                usePointStyle: true,
                pointStyle: "circle",
                padding: 16,
                font: {
                    size: 12,
                },
            },
        },
        tooltip: {
            mode: "index",
            intersect: false,
        },
    },
    scales: {
        x: {
            grid: {
                display: false,
            },
            ticks: {
                font: {
                    size: 12,
                },
            },
        },
        y: {
            beginAtZero: true,
            ticks: {
                font: {
                    size: 12,
                },
            },
        },
    },
};

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

const fetchCurrencySymbol = async () => {
    try {
        const response = await getProfile();
        const currencies = response.data?.currencies || [];
        const currencyId = authStore.company?.currency_id || response.data?.profileDetails?.currency_id;
        if (currencyId) {
            const matched = currencies.find(c => c.id === currencyId);
            currencySymbol.value = matched?.currency_symbol || "";
        }
    } catch (error) {
        currencySymbol.value = "";
    }
};

const formatAmount = (value) => {
    const num = parseFloat(value || 0);
    return `${currencySymbol.value} ${num.toFixed(2)}`;
};

const fetchCurrentMonthStats = async () => {
    try {
        loading.value = true;
        await loadReportData();
    } catch (error) {
        showErrorAlert(handleApiError(error, t));
    } finally {
        loading.value = false;
    }
};

const loadReportData = async () => {
    const businessId = authStore.company?.id;
    const branchId = authStore.company?.branch_id || null;
    const response = await getPayrollSummary(businessId, branchId, selectedYear.value, selectedMonth.value);
    payrollData.value = response.data.data || [];
    chartData.value = payrollData.value;
    const meta = response.data.meta || {};

    summaryStats.value = {
        totalSalary: meta.total_payroll || 0,
        totalDeductions: meta.total_deduction || 0,
        netSalary: meta.total_net_pay || 0,
    };
};

const generateReport = async () => {
    try {
        loading.value = true;
        await loadReportData();
    } catch (error) {
        showErrorAlert(handleApiError(error, t));
    } finally {
        loading.value = false;
    }
};

const months = [
    { value: "1", label: t("january") },
    { value: "2", label: t("february") },
    { value: "3", label: t("march") },
    { value: "4", label: t("april") },
    { value: "5", label: t("may") },
    { value: "6", label: t("june") },
    { value: "7", label: t("july") },
    { value: "8", label: t("august") },
    { value: "9", label: t("september") },
    { value: "10", label: t("october") },
    { value: "11", label: t("november") },
    { value: "12", label: t("december") },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

const generatingPayroll = ref(false);

const showGeneratePayrollDialog = async () => {
    const defaultMonth = String(selectedMonth.value);
    const defaultYear = String(selectedYear.value);

    const html = `
        <div class="payroll-dialog-selects">
            <select id="swal-month" class="swal2-select">
                <option value="" disabled>${t("select_month")}</option>
                ${months
                    .map(
                        (m) =>
                            `<option value="${m.value}" ${m.value === defaultMonth ? "selected" : ""}>${m.label}</option>`
                    )
                    .join("")}
            </select>
            <select id="swal-year" class="swal2-select">
                <option value="" disabled>${t("select_year")}</option>
                ${years
                    .map((y) => `<option value="${y}" ${String(y) === defaultYear ? "selected" : ""}>${y}</option>`)
                    .join("")}
            </select>
        </div>
    `;

    const result = await Swal.fire({
        title: t("confirm_generate_payroll"),
        html,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: t("generate"),
        cancelButtonText: t("cancel"),
        confirmButtonColor: "#9a77bc",
        cancelButtonColor: "#3085d6",
        focusConfirm: false,
        didOpen: () => {
            document.getElementById("swal-month").focus();
        },
        allowOutsideClick: () => !generatingPayroll.value,
    });

    if (result.isConfirmed) {
        const month = document.getElementById("swal-month").value;
        const year = document.getElementById("swal-year").value;

        if (!month || !year) {
            showErrorAlert(t("select_month") + " & " + t("select_year"));
            showGeneratePayrollDialog();
            return;
        }

        try {
            generatingPayroll.value = true;
            Swal.getConfirmButton().setAttribute("disabled", "disabled");
            const businessId = authStore.company?.id;
            const branchId = authStore.company?.branch_id || null;
            await generatePayroll({
                business_id: businessId,
                branch_id: branchId,
                year: Number(year),
                month: Number(month),
            });
            showSuccessAlert(t("payroll_generated_success"));
            selectedYear.value = Number(year);
            selectedMonth.value = Number(month);
            const startOfMonth = new Date(Number(year), Number(month) - 1, 1);
            const endOfMonth = new Date(Number(year), Number(month), 0);
            const from = startOfMonth.toISOString().split("T")[0];
            const to = endOfMonth.toISOString().split("T")[0];
            await loadReportData();
        } catch (error) {
            showErrorAlert(handleApiError(error, t));
        } finally {
            generatingPayroll.value = false;
            loading.value = false;
        }
    }
};

onMounted(() => {
    fetchStaffCount();
    fetchCurrencySymbol();
    fetchCurrentMonthStats();
});
</script>

<template>
    <div class="payroll-report-view">
        <div class="row align-items-center mb-4">
            <div class="col-lg-6 col-md-6">
                <h3 class="page-title">{{ $t("payroll_report") }}</h3>
            </div>
            <div class="col-lg-6 col-md-6 text-right">
                <button class="btn btn-primary btn-generate btn-sm" :disabled="generatingPayroll" @click="showGeneratePayrollDialog">
                    <span v-if="generatingPayroll" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    <svg v-if="!generatingPayroll" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="me-2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    {{ generatingPayroll ? t("processing") : $t("generate_payroll") }}
                </button>
            </div>
        </div>

        <div class="row mb-4">
            <div class="col-md-4 col-sm-6 mb-3">
                <div class="stat-card stat-card-total">
                    <div class="stat-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125S3.75 14.653 3.75 12.375" />
                        </svg>
                    </div>
                    <div class="stat-info">
                        <span class="stat-label">{{ $t("total_salary") }}</span>
                        <span class="stat-value">{{ formatAmount(summaryStats.totalSalary) }}</span>
                    </div>
                </div>
            </div>
            <div class="col-md-4 col-sm-6 mb-3">
                <div class="stat-card stat-card-deductions">
                    <div class="stat-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6v12m-3-2.818l.879-2.242m4.242-2.242L15 15m0 0l2.242-2.242m-2.242 2.242L12 15m-2.242-2.242L7.758 15m2.242-2.242L12 12m2.242-2.242L15 9m-2.242 2.242L12 6" />
                        </svg>
                    </div>
                    <div class="stat-info">
                        <span class="stat-label">{{ $t("total_deductions") }}</span>
                        <span class="stat-value">{{ formatAmount(summaryStats.totalDeductions) }}</span>
                    </div>
                </div>
            </div>
            <div class="col-md-4 col-sm-6 mb-3">
                <div class="stat-card stat-card-net">
                    <div class="stat-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div class="stat-info">
                        <span class="stat-label">{{ $t("net_salary") }}</span>
                        <span class="stat-value">{{ formatAmount(summaryStats.netSalary) }}</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="row mb-4" v-if="chartData.length > 0">
            <div class="col-md-12 col-sm-12 mb-3">
                <div class="card chart-card">
                    <div class="card-header">
                        <h5 class="card-title">{{ $t("staff_salary_details") }}</h5>
                    </div>
                    <div class="card-body">
                        <div class="chart-container">
                            <Bar :data="barChartData" :options="barChartOptions" />
                        </div>
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
                                <label class="form-label fw-semibold">{{ $t("select_month") }}</label>
                                <select v-model="selectedMonth" class="form-select py-2">
                                    <option value="" disabled>{{ $t("select_month") }}</option>
                                    <option v-for="m in months" :key="m.value" :value="Number(m.value)">{{ m.label }}</option>
                                </select>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label fw-semibold">{{ $t("select_year") }}</label>
                                <select v-model="selectedYear" class="form-select py-2">
                                    <option value="" disabled>{{ $t("select_year") }}</option>
                                    <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
                                </select>
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
                            <h4 class="card-title">{{ $t("payroll_report") }}</h4>
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
                                        :src="item.profile_pic || defaultProfilePic"
                                        class="avatar-sm rounded-circle"
                                        :alt="item.staff_name"
                                        @error="$event.target.src = defaultProfilePic"
                                    />
                                    <span class="fw-semibold">{{ item.staff_name }}</span>
                                </div>
                            </template>
                            <template #item-basic_salary="item">
                                <span class="fw-semibold text-success">{{ item.basic_salary }}</span>
                            </template>
                            <template #item-allowance="item">
                                <span class="fw-semibold">{{ item.allowance }}</span>
                            </template>
                            <template #item-bonus="item">
                                <span class="fw-semibold">{{ item.bonus }}</span>
                            </template>
                            <template #item-deduction="item">
                                <span :class="item.deduction ? 'text-danger' : 'text-muted'">{{ item.deduction }}</span>
                            </template>
                            <template #item-net_salary="item">
                                <span class="fw-semibold">{{ item.net_salary }}</span>
                            </template>
                            <template #item-present_days="item">
                                <span class="fw-semibold">{{ item.present_days }}</span>
                            </template>
                        </Vue3EasyDataTable>

                        <div v-else-if="!loading" class="text-center py-5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" fill="none" viewBox="0 0 24 24" stroke="#D1D5DB">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-3.75h7.5m-7.5 0V19.5" />
                            </svg>
                            <p class="text-muted mt-3">{{ $t("no_payroll_data") }}</p>
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

.stat-card-deductions {
    border-left: 4px solid #ef4444;
}

.stat-card-net {
    border-left: 4px solid #10b981;
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

.stat-card-deductions .stat-icon {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
}

.stat-card-net .stat-icon {
    background: rgba(16, 185, 129, 0.1);
    color: #10b981;
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

.chart-card {
    border-radius: 14px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.chart-card .card-header {
    background: transparent;
    border-bottom: 1px solid #e5e7eb;
    padding: 16px 20px;
}

.chart-card .card-title {
    font-size: 15px;
    font-weight: 600;
    color: #1a1a2e;
    margin: 0;
}

.chart-container {
    position: relative;
    height: 280px;
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

.btn-generate.btn-sm {
    padding: 6px 16px;
    font-size: 13px;
    width: auto;
}

.swal2-select {
    width: 100%;
    padding: 10px 14px;
    border-radius: 10px;
    border: 1.5px solid #e5e7eb;
    font-size: 14px;
    color: #1a1a2e;
    margin-bottom: 12px;
    background: #fff;
}

.payroll-dialog-selects {
    text-align: center;
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

:deep(.easy-data-table tbody tr) {
    height: 64px;
}

:deep(.easy-data-table tbody td) {
    padding-top: 14px !important;
    padding-bottom: 14px !important;
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

    .chart-container {
        height: 240px;
    }
}
</style>
