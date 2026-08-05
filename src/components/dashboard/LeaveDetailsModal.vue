<template>
  <div
    class="modal fade leave-details-modal"
    id="leaveDetailsModal"
    tabindex="-1"
    aria-labelledby="leaveDetailsModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header" :class="headerClass">
          <div class="d-flex align-items-center gap-2">
            <div class="modal-header-icon" :class="iconClass">
              <svg v-if="eventType === 'leave'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
            </div>
            <h5 class="modal-title" :class="titleClass">{{ modalTitle }}</h5>
          </div>
          <button
            type="button"
            class="btn btn-close-modal"
            aria-label="Close"
            @click="closeModal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="modal-body" v-if="eventData">
          <div class="details-grid">
            <div class="detail-item" v-if="eventType === 'leave' && eventData.staff_name">
              <span class="detail-label">{{ $t("leave_staff_name") }}</span>
              <span class="detail-value">{{ eventData.staff_name }}</span>
            </div>

            <div class="detail-item" v-if="eventType === 'leave' && eventData.branch_name">
              <span class="detail-label">{{ $t("leave_branch") }}</span>
              <span class="detail-value">{{ eventData.branch_name }}</span>
            </div>

            <div class="detail-item" v-if="eventData.name || eventData.title">
              <span class="detail-label">{{ eventType === 'leave' ? $t("leave_type") : $t("holiday_name") }}</span>
              <span class="detail-value">{{ eventData.name || eventData.title }}</span>
            </div>

            <div class="detail-item" v-if="eventData.start_date || eventData.start">
              <span class="detail-label">{{ $t("leave_start_date") }}</span>
              <span class="detail-value">{{ formatDate(eventData.start_date || eventData.start) }}</span>
            </div>

            <div class="detail-item" v-if="eventData.end_date || eventData.end">
              <span class="detail-label">{{ $t("leave_end_date") }}</span>
              <span class="detail-value">{{ formatDate(eventData.end_date || eventData.end) }}</span>
            </div>

            <div class="detail-item" v-if="eventData.category">
              <span class="detail-label">{{ $t("category") }}</span>
              <span class="detail-value">{{ eventData.category }}</span>
            </div>

            <div class="detail-item" v-if="eventData.locations">
              <span class="detail-label">{{ $t("location") }}</span>
              <span class="detail-value">{{ eventData.locations }}</span>
            </div>

            <div class="detail-item" v-if="eventData.tags && eventData.tags.length">
              <span class="detail-label">{{ $t("tags") }}</span>
              <span class="detail-value">{{ eventData.tags.join(", ") }}</span>
            </div>

            <div class="detail-item" v-if="eventData.duration">
              <span class="detail-label">{{ $t("leave_duration") }}</span>
              <span class="detail-value">{{ eventData.duration }} {{ $t("leave_days") }}</span>
            </div>

            <div class="detail-item" v-if="eventData.reason || eventData.description">
              <span class="detail-label">{{ $t("leave_reason") }}</span>
              <span class="detail-value">{{ eventData.reason || eventData.description || "-" }}</span>
            </div>

            <div class="detail-item" v-if="eventData.note">
              <span class="detail-label">{{ $t("leave_note") }}</span>
              <span class="detail-value">{{ eventData.note }}</span>
            </div>

            <div class="detail-item" v-if="eventData.status">
              <span class="detail-label">{{ $t("leave_status") }}</span>
              <span class="detail-value">
                <span class="status-badge" :class="statusClass(eventData.status)">
                  {{ statusLabel(eventData.status) }}
                </span>
              </span>
            </div>

            <div class="detail-item" v-if="eventData.applied_at || eventData.created_at">
              <span class="detail-label">{{ $t("applied_on") }}</span>
              <span class="detail-value">{{ formatDateTime(eventData.applied_at || eventData.created_at) }}</span>
            </div>

            <div class="detail-item" v-if="eventData.approved_by_name">
              <span class="detail-label">{{ $t("leave_approved_by") }}</span>
              <span class="detail-value">{{ eventData.approved_by_name }}</span>
            </div>

            <div class="detail-item" v-if="eventData.rejection_reason">
              <span class="detail-label">{{ $t("leave_rejection_reason") }}</span>
              <span class="detail-value text-danger">{{ eventData.rejection_reason }}</span>
            </div>

            <div class="detail-item" v-if="eventData.attachment">
              <span class="detail-label">{{ $t("leave_attachment") }}</span>
              <span class="detail-value">
                <a :href="eventData.attachment" target="_blank" rel="noopener" class="attachment-link">
                  {{ $t("download_attachment") }}
                </a>
              </span>
            </div>
          </div>
        </div>

        <div class="modal-body text-center py-5" v-else>
          <p class="text-muted">{{ $t("no_data") }}</p>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeModal">
            {{ $t("close") }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from "vue";
import { Modal } from "bootstrap";
import { useI18n } from "vue-i18n";

const props = defineProps({
  event: {
    type: Object,
    default: null,
  },
});

const { t, locale } = useI18n();

const eventData = ref(null);
const eventType = ref("leave");
const modalObject = ref(null);
const modalEl = ref(null);

const modalTitle = computed(() => {
  const rawTitle = eventData.value?.name || eventData.value?.title || "";
  const typeLabel = eventType.value === "holiday" ? t("holiday") : t("leave_details");
  if (!rawTitle) return typeLabel;
  return `${typeLabel} - ${rawTitle}`;
});

const headerClass = computed(() => {
  return eventType.value === "holiday" ? "modal-header-danger" : "modal-header-success";
});

const iconClass = computed(() => {
  return eventType.value === "holiday" ? "modal-header-icon-danger" : "modal-header-icon-success";
});

const titleClass = computed(() => {
  return eventType.value === "holiday" ? "text-white" : "text-white";
});

const statusClass = (status) => {
  const map = {
    pending: "status-pending",
    approved: "status-approved",
    rejected: "status-rejected",
  };
  return map[status] || "status-pending";
};

const statusLabel = (status) => {
  const map = {
    pending: t("leave_pending"),
    approved: t("leave_approved"),
    rejected: t("leave_rejected"),
  };
  return map[status] || status;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString(locale.value === "ms" ? "ms-MY" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleString(locale.value === "ms" ? "ms-MY" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const openModal = () => {
  nextTick(() => {
    if (!modalEl.value) {
      modalEl.value = document.getElementById("leaveDetailsModal");
    }
    if (!modalObject.value && modalEl.value) {
      modalObject.value = new Modal(modalEl.value, { backdrop: true, keyboard: true });
    }
    modalObject.value?.show();
  });
};

const closeModal = () => {
  modalObject.value?.hide();
};

watch(
  () => props.event,
  (newEvent) => {
    if (newEvent) {
      eventType.value = newEvent.type || "leave";
      eventData.value = newEvent.data || newEvent;
      openModal();
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.leave-details-modal .modal-backdrop {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.leave-details-modal .modal-dialog {
  max-width: 640px;
}

.leave-details-modal .modal-content {
  border: none;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 4px 16px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.leave-details-modal .modal-header {
  padding: 18px 24px;
  border-bottom: none;
}

.modal-header-success {
  background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%);
  color: #fff;
}

.modal-header-danger {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  color: #fff;
}

.modal-header-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.modal-header-icon-success {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.modal-header-icon-danger {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.btn-close-modal {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.2s ease;
  color: #fff;
}

.btn-close-modal:hover {
  background: rgba(255, 255, 255, 0.3);
}

.leave-details-modal .modal-body {
  padding: 24px;
  max-height: 65vh;
  overflow-y: auto;
  background: #f9fafb;
}

.leave-details-modal .modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  background: #fff;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.detail-value {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  word-break: break-word;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-approved {
  background: #d4edda;
  color: #155724;
}

.status-rejected {
  background: #f8d7da;
  color: #721c24;
}

.attachment-link {
  color: #007bff;
  text-decoration: none;
  font-weight: 600;
}

.attachment-link:hover {
  text-decoration: underline;
}

.leave-details-modal .modal-body::-webkit-scrollbar {
  width: 6px;
}

.leave-details-modal .modal-body::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 3px;
}

.leave-details-modal .modal-body::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.leave-details-modal .modal-body::-webkit-scrollbar-thumb:hover {
  background: #b0b7c3;
}

@media (max-width: 576px) {
  .details-grid {
    grid-template-columns: 1fr;
  }

  .leave-details-modal .modal-dialog {
    max-width: 95%;
    margin: 10px auto;
  }

  .leave-details-modal .modal-body {
    padding: 16px;
    max-height: 70vh;
  }
}
</style>
