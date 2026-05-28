<script setup>
import { RouterLink } from 'vue-router';
import Vue3EasyDataTable from 'vue3-easy-data-table';
import 'vue3-easy-data-table/dist/style.css';
import { computed } from 'vue';
import { onBeforeRouteLeave } from "vue-router";
import { useI18n } from 'vue-i18n';
import { hasPermission } from '../../helpers/authHelper';

const { t } = useI18n();

defineProps({
    notifications: {
        type: Array,
        default: () => [],
    },
    loading: Boolean,
});
onBeforeRouteLeave(() => {
    document.querySelectorAll(".tooltip").forEach(el => el.remove());
});
const emit = defineEmits(['notificationData', 'deleteNotification'])

const selectNotification = (notification) => {
    emit('notificationData', {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        is_active: notification.is_active ?? 0,
    });
}
const deleteNotification = (notification) => {
    emit('deleteNotification', notification.id);
}

const showIsActiveColumn = computed(() => hasPermission('can_edit_notification') || hasPermission('can_delete_notification'));

const headers = computed(() => {
    const cols = [
        { text: t('id'), value: 'id', sortable: true },
        { text: t('title'), value: 'title', sortable: true },
        { text: t('message'), value: 'message', sortable: true },
    ];

    if (showIsActiveColumn.value) {
        cols.push({ text: t('is_active'), value: 'is_active', sortable: true });
    }

    cols.push({ text: t('action'), value: 'action', sortable: false });
    return cols;
});
</script>
<template>
    <Vue3EasyDataTable :headers="headers" :items="notifications" :loading="loading" :search-field="['id', 'title', 'message']"
        :search-value="''" :sort-by="'id'" :sort-type="'asc'" :rows-per-page="10"
        :rows-per-page-message="'Rows per page:'" :rows-of-page-separator-message="'of'"
        :empty-message="'No data found'" :buttons-pagination="true" theme-color="#007bff"
        table-class-name="customize-vue-table table table-bordered">
        <template #item-is_active="item">
            <span>{{ item.is_active == 1 ? $t('yes') : $t('no') }}</span>
        </template>
        <template #item-action="item">
            <div>
                <svg v-if="hasPermission('can_edit_notification')"
                    xmlns="http://www.w3.org/2000/svg" width="18" style="color:green;cursor: pointer;"
                    @click="selectNotification(item)" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
                    class="size-6" v-tooltip="{ text: $t('edit'), placement: 'left' }">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
                <svg v-if="hasPermission('can_delete_notification')"
                    xmlns="http://www.w3.org/2000/svg" width="18" style="color:red;cursor: pointer;"
                    @click="deleteNotification(item)" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
                    class="size-6 ml-2" v-tooltip="{ text: $t('delete'), placement: 'top' }">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
            </div>
        </template>
    </Vue3EasyDataTable>
</template>