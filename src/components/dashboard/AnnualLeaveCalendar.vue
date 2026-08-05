<template>
  <div class="annual-leave-calendar">
    <div class="calendar-header d-flex align-items-center justify-content-between mb-3">
      <div class="d-flex align-items-center gap-2">
        <h5 class="mb-0 font-weight-bold">{{ $t("annual_leave_calendar") }}</h5>
      </div>
      <div class="d-flex align-items-center gap-2">
        <button type="button" class="btn btn-outline-secondary btn-sm" @click="goToToday">
          {{ $t("go_to_today") }}
        </button>
        <div class="btn-group">
          <button type="button" class="btn btn-outline-secondary btn-sm" @click="prevMonth">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button type="button" class="btn btn-outline-secondary btn-sm" @click="nextMonth">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
        <h6 class="mb-0 ms-2 calendar-month-label">{{ currentMonthYear }}</h6>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2 text-muted">{{ $t("calendar_loading") }}</p>
    </div>

    <div v-else-if="error" class="alert alert-danger d-flex align-items-center justify-content-between">
      <span>{{ $t("calendar_error") }}</span>
      <button type="button" class="btn btn-sm btn-outline-danger" @click="fetchCalendarData">{{ $t("retry") }}</button>
    </div>

    <div v-else class="calendar-grid-wrapper">
      <div class="calendar-legend d-flex mb-3 flex-wrap">
        <div class="d-flex align-items-center  mr-2">
          <span class="legend-color legend-holiday mr-1"></span>
          <span class="legend-label">{{ $t("holiday") }}</span>
        </div>
        <div class="d-flex align-items-center mr-2">
          <span class="legend-color legend-leave mr-1"></span>
          <span class="legend-label">{{ $t("staff_leave") }}</span>
        </div>
        <div class="d-flex align-items-center mr-2">
          <span class="legend-color legend-today mr-1"></span>
          <span class="legend-label">{{ $t("today") }}</span>
        </div>
      </div>

      <div class="calendar-grid">
        <div class="calendar-weekday-header" v-for="day in weekDays" :key="day">
          {{ day }}
        </div>

        <div
          v-for="(cell, index) in calendarCells"
          :key="index"
          class="calendar-cell"
          :class="{
            'other-month': !cell.isCurrentMonth,
            'is-today': cell.isToday,
          }"
        >
          <div class="calendar-cell-header">
            <span class="calendar-day-number">{{ cell.day }}</span>
          </div>
          <div class="calendar-events">
            <button
              v-for="event in cell.events"
              :key="event.id"
              type="button"
              class="calendar-event-chip"
              :class="{
                'event-holiday': event.type === 'holiday',
                'event-leave': event.type === 'leave',
              }"
              @click.stop="$emit('eventClick', event)"
            >
              <span class="event-name">{{ event.name }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { getCalendarEvents } from "../../services/leaveService";

const { t, locale } = useI18n();

const emit = defineEmits(["eventClick"]);

const currentDate = ref(new Date());
const loading = ref(false);
const error = ref(false);
const events = ref([]);

const weekDays = computed(() => {
  const days = [
    t("sunday") || "Sun",
    t("monday") || "Mon",
    t("tuesday") || "Tue",
    t("wednesday") || "Wed",
    t("thursday") || "Thu",
    t("friday") || "Fri",
    t("saturday") || "Sat",
  ];
  return days;
});

const currentMonthYear = computed(() => {
  const date = currentDate.value;
  const month = date.toLocaleString(locale.value === "ms" ? "ms-MY" : "en-US", { month: "long" });
  const year = date.getFullYear();
  return `${month} ${year}`;
});

const year = computed(() => currentDate.value.getFullYear());
const month = computed(() => currentDate.value.getMonth());

const calendarCells = computed(() => {
  const cells = [];
  const firstDay = new Date(year.value, month.value, 1);
  const lastDay = new Date(year.value, month.value + 1, 0);
  const daysInMonth = lastDay.getDate();

  let startDayOfWeek = firstDay.getDay();
  const prevMonthLastDay = new Date(year.value, month.value, 0).getDate();

  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    const date = new Date(year.value, month.value - 1, day);
    cells.push(createCell(day, date, false));
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year.value, month.value, day);
    cells.push(createCell(day, date, true));
  }

  const remainingCells = 42 - cells.length;
  for (let day = 1; day <= remainingCells; day++) {
    const date = new Date(year.value, month.value + 1, day);
    cells.push(createCell(day, date, false));
  }

  return cells;
});

function createCell(day, date, isCurrentMonth) {
  const today = new Date();
  const isToday =
    isCurrentMonth &&
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const dateStr = formatDateStr(date);
  const dayEvents = [];

  events.value.forEach((evt) => {
    const evtStart = new Date(evt.start);
    const evtEnd = new Date(evt.end);
    const checkDate = new Date(dateStr);
    if (checkDate >= evtStart && checkDate <= evtEnd) {
      const isLeave = evt.type === "leave";
      const displayTitle = evt.title || evt.name || "";
      const staffName = isLeave ? displayTitle.split(" - ")[0] : "";
      const leaveTypeLabel = isLeave ? displayTitle.split(" - ")[1] : "";

      dayEvents.push({
        id: evt.id,
        type: evt.type,
        name: displayTitle,
        data: {
          ...evt,
          name: displayTitle,
          staff_name: staffName,
          leave_type_label: leaveTypeLabel,
          start_date: evt.start,
          end_date: evt.end,
        },
      });
    }
  });

  return {
    day,
    date,
    isCurrentMonth,
    isToday,
    events: dayEvents.slice(0, 3),
  };
}

function formatDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function prevMonth() {
  currentDate.value = new Date(year.value, month.value - 1, 1);
}

function nextMonth() {
  currentDate.value = new Date(year.value, month.value + 1, 1);
}

function goToToday() {
  currentDate.value = new Date();
}

async function fetchCalendarData() {
  loading.value = true;
  error.value = false;
  try {
    const startDate = new Date(year.value, month.value, 1);
    const endDate = new Date(year.value, month.value + 1, 0);

    const from = formatDateStr(startDate);
    const to = formatDateStr(endDate);

    const response = await getCalendarEvents({ from, to });
    events.value = response.data?.data || [];
  } catch (err) {
    console.error(err);
    error.value = true;
  } finally {
    loading.value = false;
  }
}

watch([year, month], () => {
  fetchCalendarData();
});

onMounted(() => {
  fetchCalendarData();
});
</script>

<style scoped>
.annual-leave-calendar {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.calendar-header {
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.calendar-month-label {
  font-weight: 700;
  color: #1a1a2e;
  min-width: 160px;
  text-align: center;
  font-size: 15px;
}

.calendar-legend {
  padding: 8px 0;
}

.legend-color {
  width: 14px;
  height: 14px;
  border-radius: 4px;
  display: inline-block;
  flex-shrink: 0;
}

.legend-holiday {
  background: #dc3545;
}

.legend-leave {
  background: #28a745;
}

.legend-today {
  background: #007bff;
  border: 2px solid #007bff;
}

.legend-label {
  font-size: 13px;
  color: #4b5563;
  font-weight: 500;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: auto repeat(6, 1fr);
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  min-height: 520px;
}

.calendar-weekday-header {
  background: #f8f9fa;
  padding: 10px 6px;
  text-align: center;
  font-weight: 700;
  font-size: 13px;
  color: #4b5563;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #e5e7eb;
  border-right: 1px solid #e5e7eb;
}

.calendar-cell {
  min-height: 80px;
  padding: 6px;
  border-right: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
  background: #fff;
  transition: background 0.15s ease;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.calendar-cell:nth-child(7n) {
  border-right: none;
}

.calendar-cell.other-month {
  background: #f9fafb;
}

.calendar-cell.other-month .calendar-day-number {
  color: #d1d5db;
}

.calendar-cell.is-today {
  background: #eff6ff;
}

.calendar-cell.is-today .calendar-day-number {
  background: #007bff;
  color: #fff;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
}

.calendar-cell-header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 2px;
}

.calendar-day-number {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.calendar-events {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  overflow: hidden;
}

.calendar-event-chip {
  display: block;
  width: 100%;
  text-align: left;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.35;
  cursor: pointer;
  border: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: opacity 0.15s ease, transform 0.1s ease;
  background: transparent;
  color: inherit;
}

.calendar-event-chip:hover {
  opacity: 0.85;
  transform: translateX(1px);
}

.calendar-event-chip:focus {
  outline: 2px solid #007bff;
  outline-offset: 1px;
}

.event-holiday {
  background: #f8d7da;
  color: #721c24;
  border-left: 3px solid #dc3545;
}

.event-leave {
  background: #d4edda;
  color: #155724;
  border-left: 3px solid #28a745;
}

.event-name {
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 768px) {
  .annual-leave-calendar {
    padding: 12px;
  }

  .calendar-grid {
    min-height: 400px;
  }

  .calendar-cell {
    min-height: 60px;
    padding: 4px;
  }

  .calendar-weekday-header {
    padding: 8px 2px;
    font-size: 11px;
  }

  .calendar-event-chip {
    font-size: 10px;
    padding: 2px 4px;
  }

  .calendar-day-number {
    font-size: 11px;
    width: 22px;
    height: 22px;
  }

  .calendar-month-label {
    font-size: 13px;
    min-width: 120px;
  }
}
</style>
