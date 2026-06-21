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
        <div class="col-md-12 mb-4 mt-1">
          <div class="d-flex flex-wrap justify-content-between align-items-center">
            <h4 class="font-weight-bold">{{ $t("overview") }}</h4>
            <div class="d-flex flex-wrap align-items-center gap-3">
              <select v-model="selectedBranchId" class="form-select mr-2" style="min-width: 200px;" @change="fetchStats">
                <option value="">{{ $t("all_branches") }}</option>
                <option v-for="branch in branches" :key="branch.id" :value="branch.id">
                  {{ branch.name }}
                </option>
              </select>
              <VueDatePicker v-model="dateRange" range placeholder="Select Date Range" style="min-width: 240px;" />
              <button type="button" class="btn btn-outline-secondary px-4 me-2" @click="resetFilters">
                {{ $t("reset") || "Reset" }}
              </button>
              <button type="button" class="btn btn-primary px-4" @click="submitDates">
                {{ $t("submit") }}
              </button>
            </div>
          </div>
        </div>

    <div class="col-lg-8 col-md-12">
      <div class="row">
        <div class="col-md-4">
          <div class="card">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="">
                  <p class="mb-2 text-secondary">{{ $t("total_branches") }}</p>
                  <div class="d-flex flex-wrap justify-content-start align-items-center">
                    <div v-if="loading" class="spinner-border spinner-border-sm" role="status"><span class="sr-only">Loading</span></div>
                    <h5 v-else class="mb-0 font-weight-bold">{{ totalBranches }}</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="">
                  <p class="mb-2 text-secondary">{{ $t("total_employees") }}</p>
                  <div class="d-flex flex-wrap justify-content-start align-items-center">
                    <div v-if="loading" class="spinner-border spinner-border-sm" role="status"><span class="sr-only">Loading</span></div>
                    <h5 v-else class="mb-0 font-weight-bold">{{ totalStaff }}</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="">
                  <p class="mb-2 text-secondary">{{ $t("present_employees") }}</p>
                  <div class="d-flex flex-wrap justify-content-start align-items-center">
                    <div v-if="loading" class="spinner-border spinner-border-sm" role="status"><span class="sr-only">Loading</span></div>
                    <h5 v-else class="mb-0 font-weight-bold">{{ presentStaff }}</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="">
                  <p class="mb-2 text-secondary">{{ $t("absent_employees") }}</p>
                  <div class="d-flex flex-wrap justify-content-start align-items-center">
                    <div v-if="loading" class="spinner-border spinner-border-sm" role="status"><span class="sr-only">Loading</span></div>
                    <h5 v-else class="mb-0 font-weight-bold">{{ absentStaff }}</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="">
                  <p class="mb-2 text-secondary">{{ $t("on_leave_staff") }}</p>
                  <div class="d-flex flex-wrap justify-content-start align-items-center">
                    <div v-if="loading" class="spinner-border spinner-border-sm" role="status"><span class="sr-only">Loading</span></div>
                    <h5 v-else class="mb-0 font-weight-bold">{{ onLeaveStaff }}</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

