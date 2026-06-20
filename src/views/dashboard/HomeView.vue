<script setup>
import { onMounted, ref, computed, onUnmounted } from 'vue'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { useAuthStore } from '../../stores/authStore'
import { initEcho, getEcho } from '../../services/echo'
import { useToast } from '../../helpers/useToast'
import { useI18n } from 'vue-i18n'
import { getDashboardStats } from '../../services/dashboardService'
import { handleApiError } from '../../helpers/handleApiError'

const { locale } = useI18n()
const authStore = useAuthStore()
const { toast } = useToast()

const dateRange = ref(null)
const presentEmployees = ref(0)
const stats = ref(null)
const loading = ref(false)

const selectedBusinessId = computed(() => {
  return authStore.company?.id || ''
})

const fetchStats = async () => {
  if (!selectedBusinessId.value) return

  loading.value = true
  try {
    const params = { business_id: selectedBusinessId.value }

    if (dateRange.value && Array.isArray(dateRange.value) && dateRange.value.length === 2) {
      const [start, end] = dateRange.value
      params.from = start.toISOString().split('T')[0]
      params.to = end.toISOString().split('T')[0]
    }

    const response = await getDashboardStats(params)
    stats.value = response.data

    if (typeof response.data.present_staff !== 'undefined') {
      presentEmployees.value = response.data.present_staff
    }
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const totalBranches = computed(() => stats.value?.total_branches ?? 0)
const totalEmployees = computed(() => stats.value?.total_staff ?? 0)
const absentEmployees = computed(() => stats.value?.absent_staff ?? 0)
const onLeaveEmployees = computed(() => stats.value?.on_leave_staff ?? 0)

const submitDates = () => {
  fetchStats()
}

const handleAttendanceNotification = (payload) => {
  const data = payload?.data || {}

  const template = locale.value === 'ms'
    ? '{{staffName}} telah daftar hadir di cawangan {{branchName}}'
    : '{{staffName}} checked in at {{branchName}} branch'

  const translated = template
    .replace('{{staffName}}', data.staff_name || '')
    .replace('{{branchName}}', data.branch_name || '')

  if (payload?.type === 'attendance_alert') {
    presentEmployees.value += 1
  }

  toast(translated, 'success', 4000)
  playNotificationSound()
}

const playNotificationSound = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioCtx.createOscillator()
    const gainNode = audioCtx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioCtx.destination)

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime)
    oscillator.frequency.setValueAtTime(1100, audioCtx.currentTime + 0.1)

    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3)

    oscillator.start(audioCtx.currentTime)
    oscillator.stop(audioCtx.currentTime + 0.3)
  } catch (e) {
    // silent fail
  }
}

onMounted(() => {
  fetchStats()

  const token = authStore.token
  if (!token) return

  const echo = initEcho(token)
  const businessId = authStore.company?.id
  if (!businessId) return

  const channel = `attendance.${businessId}`
  echo.private(channel).listen('.attendance.notification', handleAttendanceNotification)
})

onUnmounted(() => {
  const businessId = authStore.company?.id
  if (businessId) {
  const instance = getEcho()
  if (instance) {
    instance.leave(`attendance.${businessId}`)
  }
  }
})
</script>

<template>
  <div class="row">
    <div class="col-md-12 mb-4 mt-1">
      <div class="d-flex flex-wrap justify-content-between align-items-center">
        <h4 class="font-weight-bold">{{ $t('overview') }}</h4>
        <div class="form-group mb-0 d-flex flex-row">
          <VueDatePicker v-model="dateRange" range placeholder="Select Date Range" class="me-2" />
          <button type="button" class="btn btn-primary" @click="submitDates">Submit</button>
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
                  <p class="mb-2 text-secondary">{{ $t('total_branches') }}</p>
                  <div class="d-flex flex-wrap justify-content-start align-items-center">
                    <div v-if="loading" class="spinner-border spinner-border-sm" role="status">
                      <span class="sr-only">Loading...</span>
                    </div>
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
                  <p class="mb-2 text-secondary">{{ $t('total_employees') }}</p>
                  <div class="d-flex flex-wrap justify-content-start align-items-center">
                    <div v-if="loading" class="spinner-border spinner-border-sm" role="status">
                      <span class="sr-only">Loading...</span>
                    </div>
                    <h5 v-else class="mb-0 font-weight-bold">{{ totalEmployees }}</h5>
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
                  <p class="mb-2 text-secondary">{{ $t('present_employees') }}</p>
                  <div class="d-flex flex-wrap justify-content-start align-items-center">
                    <div v-if="loading" class="spinner-border spinner-border-sm" role="status">
                      <span class="sr-only">Loading...</span>
                    </div>
                    <h5 v-else class="mb-0 font-weight-bold">{{ presentEmployees }}</h5>
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
                  <p class="mb-2 text-secondary">{{ $t('absent_employees') }}</p>
                  <div class="d-flex flex-wrap justify-content-start align-items-center">
                    <div v-if="loading" class="spinner-border spinner-border-sm" role="status">
                      <span class="sr-only">Loading...</span>
                    </div>
                    <h5 v-else class="mb-0 font-weight-bold">{{ absentEmployees }}</h5>
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
