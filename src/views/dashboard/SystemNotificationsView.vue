<script setup>
import { ref, onMounted } from "vue";
import SystemNotifications from "../../components/dashboard/SystemNotifications.vue";
import { getSystemNotifications } from "../../services/systemNotificationService";
import { storeSystemNotification } from "../../services/systemNotificationService";
import { updateSystemNotification } from "../../services/systemNotificationService";
import { deleteSystemNotification } from "../../services/systemNotificationService";
import { handleApiError } from '../../helpers/handleApiError'
import { showErrorAlert } from '../../helpers/swal'
import Swal from 'sweetalert2'
import { useI18n } from 'vue-i18n'
import { Modal } from "bootstrap"
import { hasPermission } from "../../helpers/authHelper";
import { useRouter } from 'vue-router';

const { t } = useI18n();
const router = useRouter();

const loading = ref(false);
const systemNotifications = ref([]);
const modalObject = ref(null);
const title = ref(null);
const message = ref(null);
const isActive = ref(false);
const errorsMessage = ref(null);
const editingSystemNotificationId = ref(null);
const modalTitle = ref(null);

const fetchSystemNotifications = async () => {
    try {
        loading.value = true;
        const response = await getSystemNotifications();
        systemNotifications.value = response.data.system_notifications;
    } catch (error) {
        showErrorAlert(handleApiError(error, t));
    } finally {
        loading.value = false;
    }
}
onMounted(() => {
    modalTitle.value = t("add");
    fetchSystemNotifications();
});
const openModal = () => {
    const modalEl = document.getElementById("systemNotificationModal")
    modalObject.value = new Modal(modalEl)
    editingSystemNotificationId.value = null;
    title.value = null;
    message.value = null;
    isActive.value = false;
    modalTitle.value = t("add");
    modalObject.value.show()
}
const closeModal = () => {
    if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur()
    }
    modalObject.value.hide()
}
const saveSystemNotification = async () => {
    try {
        if (title.value != null) {
            loading.value = true
            const payload = {
                title: title.value,
                message: message.value,
                is_active: isActive.value ? 1 : 0,
            }

            if (editingSystemNotificationId.value) {
                await updateSystemNotification(editingSystemNotificationId.value, payload)
            } else {
                await storeSystemNotification(payload)
            }
            title.value = "";
            message.value = null;
            isActive.value = false;
            editingSystemNotificationId.value = null;
            modalObject.value.hide()
            // refresh table
            fetchSystemNotifications()
        } else {
            errorsMessage.value = "Title is required";
        }
    } catch (error) {
        showErrorAlert(handleApiError(error, t));
    } finally {
        loading.value = false
    }
}
const handleSystemNotificationData = (data) => {
    const modalEl = document.getElementById("systemNotificationModal")
    modalObject.value = new Modal(modalEl)
    title.value = data.title;
    message.value = data.message;
    isActive.value = data.is_active == 1 ? true : false;
    editingSystemNotificationId.value = data.id;
    modalTitle.value = t("edit");
    modalObject.value.show();
};
const handleDeleteSystemNotification = async (id) => {
    const result = await Swal.fire({
        title: t('are_you_sure'),
        text: t('delete_system_notification_confirm'),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: t('yes_delete'),
        cancelButtonText: t('cancel')
    });

    if (result.isConfirmed) {
        try {
            loading.value = true;
            await deleteSystemNotification(id);
            fetchSystemNotifications();
        } catch (error) {
            showErrorAlert(handleApiError(error, t));
        } finally {
            loading.value = false;
        }
    }
};
const goToNotifications = () => {
    router.push('/notifications');
};
</script>
<template>

    <div class="row">
        <div class="col-sm-12 col-lg-12">
            <div class="card">
                <div class="card-header d-flex justify-content-between">
                    <div class="header-title">
                        <h4 class="card-title">{{ $t('system_notifications') }}</h4>
                    </div>
                    <div class="header-action">
                        <button class="btn btn-primary" @click="openModal">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" fill="none" viewBox="0 0 24 24"
                                stroke-width="1.5" stroke="currentColor" class="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            {{ $t('add') }}
                        </button>
                        <button v-if="hasPermission('can_access_notification')" class="btn btn-success ms-2" @click="goToNotifications">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" fill="none" viewBox="0 0 24 24"
                                stroke-width="1.5" stroke="currentColor" class="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                            </svg>
                            {{ $t('notifications') }}
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <SystemNotifications :systemNotifications="systemNotifications" :loading="loading" @systemNotificationData="handleSystemNotificationData"
                        @deleteSystemNotification="handleDeleteSystemNotification" />
                </div>
            </div>
        </div>

    </div>
    <div class="modal fade" id="systemNotificationModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">

                <div class="modal-header">
                    <h5 class="modal-title">{{ modalTitle }} {{ $t('system_notification') }}</h5>

                    <button type="button" class="close" data-dismiss="modal" aria-label="Close" @click="closeModal">
                        <span aria-hidden="true">×</span>
                    </button>
                </div>

                <div class="modal-body">

                    <!-- System Notification Title -->
                    <div class="mb-3">
                        <label class="form-label">{{ $t('title') }}</label>
                        <input type="text" class="form-control" v-model="title" />
                        <span class="text-danger" v-if="errorsMessage">
                            {{ errorsMessage }}
                        </span>
                    </div>
                    <!-- System Notification Message -->
                    <div class="mb-3">
                        <label class="form-label">{{ $t('message') }}</label>
                        <textarea class="form-control" v-model="message" rows="3"></textarea>
                        <span class="text-danger" v-if="errorsMessage">
                            {{ errorsMessage }}
                        </span>
                    </div>
                    <!-- System Notification Active Status -->
                    <div class="mb-3">
                        <div class="custom-control custom-checkbox custom-checkbox-color-check custom-control-inline">
                            <input type="checkbox" class="custom-control-input bg-primary" id="systemCustomCheck-1"
                                v-model="isActive">
                            <label class="custom-control-label" for="systemCustomCheck-1"> {{ $t('is_active') }}</label>
                        </div>
                        <span class="text-danger" v-if="errorsMessage">
                            {{ errorsMessage }}
                        </span>
                    </div>

                </div>

                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="closeModal">
                        {{ $t('cancel') }}
                    </button>

                    <button class="btn btn-primary" :disabled="loading" @click="saveSystemNotification">
                        {{ loading ? "Saving..." : $t('save') }}
                    </button>
                </div>

            </div>
        </div>
    </div>
</template>