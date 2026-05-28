<script setup>
import { ref, onMounted, reactive } from "vue";
import Notifications from "../../components/dashboard/Notifications.vue";
import { getNotifications } from "../../services/notificationService";
import { storeNotification } from "../../services/notificationService";
import { updateNotification } from "../../services/notificationService";
import { deleteNotification } from "../../services/notificationService";
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
const notifications = ref([]);
const modalObject = ref(null);
const title = ref(null);
const message = ref(null);
const isActive = ref(false);
const errorsMessage = ref(null);
const editingNotificationId = ref(null);
const modalTitle = ref(null);

const fetchNotifications = async () => {
    try {
        loading.value = true;
        const response = await getNotifications();
        notifications.value = response.data.notifications;
    } catch (error) {
        showErrorAlert(handleApiError(error, t));
    } finally {
        loading.value = false;
    }
}
onMounted(() => {
    modalTitle.value = t("add");
    fetchNotifications();
});
const openModal = () => {
    const modalEl = document.getElementById("notificationModal")
    modalObject.value = new Modal(modalEl)
    editingNotificationId.value = null;
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
const saveNotification = async () => {
    try {
        if (title.value != null) {
            loading.value = true
            const payload = {
                title: title.value,
                message: message.value,
                is_active: isActive.value ? 1 : 0,
            }

            if (editingNotificationId.value) {
                await updateNotification(editingNotificationId.value, payload)
            } else {
                await storeNotification(payload)
            }
            title.value = "";
            message.value = null;
            isActive.value = false;
            editingNotificationId.value = null;
            modalObject.value.hide()
            // refresh table
            fetchNotifications()
        } else {
            errorsMessage.value = "Title is required";
        }
    } catch (error) {
        showErrorAlert(handleApiError(error, t));
    } finally {
        loading.value = false
    }
}
const handleNotificationData = (data) => {
    const modalEl = document.getElementById("notificationModal")
    modalObject.value = new Modal(modalEl)
    title.value = data.title;
    message.value = data.message;
    isActive.value = data.is_active == 1 ? true : false;
    editingNotificationId.value = data.id;
    modalTitle.value = t("edit");
    modalObject.value.show();
};
const handleDeleteNotification = async (id) => {
    const result = await Swal.fire({
        title: t('are_you_sure'),
        text: t('delete_notification_confirm'),
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
            await deleteNotification(id);
            fetchNotifications();
        } catch (error) {
            showErrorAlert(handleApiError(error, t));
        } finally {
            loading.value = false;
        }
    }
};
</script>
<template>

    <div class="row">
        <div class="col-sm-12 col-lg-12">
            <div class="card">
                <div class="card-header d-flex justify-content-between">
                    <div class="header-title">
                        <h4 class="card-title">{{ $t('notifications') }}</h4>
                    </div>
                    <div class="header-action">
                        <button v-if="hasPermission('can_access_system_notification')" class="btn btn-primary mr-2"
                            @click="openModal">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" fill="none" viewBox="0 0 24 24"
                                stroke-width="1.5" stroke="currentColor" class="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            {{ $t('add_system_notification') }}
                        </button>
                        <button v-if="hasPermission('can_access_system_notification')" class="btn btn-success ms-2"
                            @click="goToSystemNotifications">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" fill="none" viewBox="0 0 24 24"
                                stroke-width="1.5" stroke="currentColor" class="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                            </svg>
                            {{ $t('system_notifications') }}
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <Notifications :notifications="notifications" :loading="loading"
                        @notificationData="handleNotificationData" @deleteNotification="handleDeleteNotification" />
                </div>
            </div>
        </div>

    </div>
    <div class="modal fade" id="notificationModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">

                <div class="modal-header">
                    <h5 class="modal-title">{{ modalTitle }} {{ $t('notification') }}</h5>

                    <button type="button" class="close" data-dismiss="modal" aria-label="Close" @click="closeModal">
                        <span aria-hidden="true">×</span>
                    </button>
                </div>

                <div class="modal-body">

                    <!-- Notification Title -->
                    <div class="mb-3">
                        <label class="form-label">{{ $t('title') }}</label>
                        <input type="text" class="form-control" v-model="title" />
                        <span class="text-danger" v-if="errorsMessage">
                            {{ errorsMessage }}
                        </span>
                    </div>
                    <!-- Notification Message -->
                    <div class="mb-3">
                        <label class="form-label">{{ $t('message') }}</label>
                        <textarea class="form-control" v-model="message" rows="3"></textarea>
                        <span class="text-danger" v-if="errorsMessage">
                            {{ errorsMessage }}
                        </span>
                    </div>
                    <!-- Notification Active Status -->
                    <div class="mb-3" v-if="hasPermission('can_edit_notification')">
                        <div class="custom-control custom-checkbox custom-checkbox-color-check custom-control-inline">
                            <input type="checkbox" class="custom-control-input bg-primary" id="customCheck-1"
                                v-model="isActive">
                            <label class="custom-control-label" for="customCheck-1"> {{ $t('is_active') }}</label>
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

                    <button class="btn btn-primary" :disabled="loading" @click="saveNotification">
                        {{ loading ? "Saving..." : $t('save') }}
                    </button>
                </div>

            </div>
        </div>
    </div>
</template>