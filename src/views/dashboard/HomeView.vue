<script setup>
import { onMounted, ref, computed, onUnmounted } from "vue";
import { useAuthStore } from "../../stores/authStore";
import { initEcho, getEcho } from "../../services/echo";
import { useToast } from "../../helpers/useToast";
import { useI18n } from "vue-i18n";
import { getDashboardStats } from "../../services/dashboardService";
import { getBranches } from "../../services/branchService";
import { handleApiError } from "../../helpers/handleApiError";
import { VueDatePicker } from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";

const { locale } = useI18n();
const authStore = useAuthStore();
const { toast } = useToast();

const dateRange = ref(null);
const stats = ref(null);
const presentEmployees = ref(0);
const loading = ref(false);
const branches = ref([]);
const selectedBranchId = ref("");

const selectedBusinessId = computed(() => authStore.company?.id ?? "");

const fetchStats = async () => {
  if (!selectedBusinessId.value) return;
  loading.value = true;
  try {
    const params = { business_id: selectedBusinessId.value };
    if (selectedBranchId.value) {
      params.branch_id = selectedBranchId.value;
    }
    if (dateRange.value && Array.isArray(dateRange.value) && dateRange.value.length === 2) {
      params.from = dateRange.value[0]?.toISOString().split("T")[0];
      params.to = dateRange.value[1]?.toISOString().split("T")[0];
    }
    const response = await getDashboardStats(params);
    stats.value = response.data;
    presentEmployees.value = response.data?.present_staff ?? 0;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const fetchBranches = async () => {
  const companyId = selectedBusinessId.value;
  if (!companyId) return;
  try {
    const response = await getBranches(companyId);
    branches.value = response?.data?.branches ?? [];
  } catch (err) {
    console.error(err);
  }
};

const totalBranches = computed(() => stats.value?.total_branches ?? 0);
const totalStaff = computed(() => stats.value?.total_staff ?? 0);
const absentStaff = computed(() => stats.value?.absent_staff ?? 0);
const onLeaveStaff = computed(() => stats.value?.on_leave_staff ?? 0);
const presentStaff = computed(() => presentEmployees.value);

const submitDates = () => {
  fetchStats();
};

const resetFilters = () => {
  dateRange.value = null;
  selectedBranchId.value = "";
  fetchStats();
};

const showNotification = (message) => {
  toast(message, "success", 4000);
  playNotificationSound();
};

const playNotificationSound = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, audioCtx.currentTime);
    osc.frequency.setValueAtTime(1100, audioCtx.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.3);
  } catch (e) {
    // no-op
  }
};

const handleAttendanceNotification = (payload) => {
  const data = payload?.data || {};
  const staff = data.staff_name ?? "";
  const branch = data.branch_name ?? "";

  const message =
    locale.value === "ms"
      ? `${staff} telah hadir di cawangan ${branch}`
      : `${staff} checked in at ${branch} branch`;

  if (payload?.type === "attendance_alert") {
    presentEmployees.value += 1;
  }
  showNotification(message);
};

onMounted(() => {
  fetchStats();
  fetchBranches();
  const token = authStore.token;
  if (!token) return;
  const echo = initEcho(token);
  const businessId = selectedBusinessId.value;
  if (businessId) {
    echo.private(`attendance.${businessId}`).listen(".attendance.notification", handleAttendanceNotification);
  }
});

onUnmounted(() => {
  const businessId = selectedBusinessId.value;
  if (!businessId) return;
  const echo = getEcho();
  if (echo) {
    echo.leave(`attendance.${businessId}`);
  }
});
</script>

<template>
  <div class="row">
    <div class="col-md-12 mb-4">
      <div class="d-flex flex-wrap justify-content-between align-items-center mb-2">
        <h4 class="font-weight-bold">{{ $t("overview") }}</h4>
        <div class="d-flex flex-wrap align-items-center gap-3">
          <select v-model="selectedBranchId" class="form-select mr-2" style="min-width: 200px;" @change="fetchStats">
            <option value="">{{ $t("all_branches") }}</option>
            <option v-for="branch in branches" :key="branch.id" :value="branch.id">
              {{ branch.name }}
            </option>
          </select>
          <VueDatePicker v-model="dateRange" range placeholder="Select Date Range" style="min-width: 240px; margin-right: 10px;" />
          <button type="button" class="btn btn-outline-secondary mr-2" @click="resetFilters">
            {{ $t("reset") || "Reset" }}
          </button>
          <button type="button" class="btn btn-primary" @click="submitDates">
            {{ $t("submit") }}
          </button>
        </div>
      </div>
    </div>

    <div class="col-lg-12 col-md-12">
      <div class="row">
        <div class="col-md-4 mb-2">
          <div class="status-card purple">
            <div class="d-flex align-items-center">
              <div class="status-icon purple mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div>
                <p class="status-label mb-1">{{ $t("total_branches") }}</p>
                <div class="d-flex flex-wrap justify-content-start align-items-center">
                  <div v-if="loading" class="spinner-border spinner-border-sm" role="status"><span class="sr-only">Loading</span></div>
                  <h5 v-else class="status-number mb-0">{{ totalBranches }}</h5>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4 mb-2">
          <div class="status-card purple">
            <div class="d-flex align-items-center">
              <div class="status-icon purple mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <div>
                <p class="status-label mb-1">{{ $t("total_employees") }}</p>
                <div class="d-flex flex-wrap justify-content-start align-items-center">
                  <div v-if="loading" class="spinner-border spinner-border-sm" role="status"><span class="sr-only">Loading</span></div>
                  <h5 v-else class="status-number mb-0">{{ totalStaff }}</h5>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="status-card primary">
            <div class="d-flex align-items-center">
              <div class="status-icon primary mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21a3.745 3.745 0 01-3.068-1.593 3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </svg>
              </div>
              <div>
                <p class="status-label mb-1">{{ $t("present_employees") }}</p>
                <div class="d-flex flex-wrap justify-content-start align-items-center">
                  <div v-if="loading" class="spinner-border spinner-border-sm" role="status"><span class="sr-only">Loading</span></div>
                  <h5 v-else class="status-number mb-0">{{ presentStaff }}</h5>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="status-card danger">
            <div class="d-flex align-items-center">
              <div class="status-icon danger mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <p class="status-label mb-1">{{ $t("absent_employees") }}</p>
                <div class="d-flex flex-wrap justify-content-start align-items-center">
                  <div v-if="loading" class="spinner-border spinner-border-sm" role="status"><span class="sr-only">Loading</span></div>
                  <h5 v-else class="status-number mb-0">{{ absentStaff }}</h5>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="status-card warning">
            <div class="d-flex align-items-center">
              <div class="status-icon warning mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
              <div>
                <p class="status-label mb-1">{{ $t("on_leave_staff") }}</p>
                <div class="d-flex flex-wrap justify-content-start align-items-center">
                  <div v-if="loading" class="spinner-border spinner-border-sm" role="status"><span class="sr-only">Loading</span></div>
                  <h5 v-else class="status-number mb-0">{{ onLeaveStaff }}</h5>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

