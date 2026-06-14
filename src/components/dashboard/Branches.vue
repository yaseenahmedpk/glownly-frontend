<script setup>
import Vue3EasyDataTable from 'vue3-easy-data-table';
import 'vue3-easy-data-table/dist/style.css';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Swal from 'sweetalert2';

const { t } = useI18n();
defineProps({
    branches: {
        type: Array,
        default: () => [],
    },
    loading: Boolean,
});

const emit = defineEmits(['branchData', 'deleteBranch'])
const selectBranch = (branch) => {
    emit('branchData', branch);
}
const deleteBranch = (branch) => {
    emit('deleteBranch', branch.id);
}
const showQrCode = (qrcodeUrl) => {
    Swal.fire({
        title: 'QR Code',
        showCloseButton: true,
        width: 500,
        html: `<img src="${qrcodeUrl}" alt="QR Code" style="max-width: 100%; height: auto;" />`,
        backdrop: `
            rgba(0, 0, 0, 0.8)
            url("/gif/pixel.gif")
            left top
            no-repeat
        `
    });
}

const headers = computed(() => {
    return [
        { text: t('id'), value: 'id', sortable: true },
        { text: t('name'), value: 'name', sortable: true },
        { text: t('code'), value: 'code', sortable: true },
        { text: t('city'), value: 'city', sortable: true },
        { text: t('action'), value: 'action', sortable: false },
    ];
});

const actionsSlot = (item) => {
    return `
        <div>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" style="color:green;cursor: pointer;"
                onclick="window.selectBranch(${item.id})" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor" class="size-6"
                v-tooltip="{ text: 'Edit Branch', placement: 'left' }">
                <path stroke-linecap="round" stroke-linejoin="round"
                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" style="color:red;cursor: pointer;"
                onclick="window.deleteBranch(${item.id})" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 ml-2"
                v-tooltip="{ text: 'Delete Branch', placement: 'right' }">
                <path stroke-linecap="round" stroke-linejoin="round"
                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
        </div>
    `;
};
</script>

<template>
    <Vue3EasyDataTable :headers="headers" :items="branches" :loading="loading" :search-field="[]" :sort-by="'id'"
        :sort-type="'asc'" :rows-per-page="10" :rows-per-page-message="'Rows per page:'"
        :rows-of-page-separator-message="'of'" :empty-message="'No data found'" :buttons-pagination="true"
        theme-color="#007bff" table-class-name="customize-vue-table table table-bordered">
        <template #item-action="item">
            <div>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" style="color:green;cursor: pointer;"
                    @click="selectBranch(item)" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
                    class="size-6" v-tooltip="{ text: $t('edit'), placement: 'left' }">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" style="color:red;cursor: pointer;"
                    @click="deleteBranch(item)" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
                    class="size-6 ml-2" v-tooltip="{ text: $t('delete'), placement: 'right' }">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" style="color:blue;cursor: pointer;"
                    @click="showQrCode(item.qr_code_url)" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                    stroke="currentColor" class="size-6 ml-2" v-tooltip="{ text: $t('show_qr_code'), placement: 'top' }">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z" />
                </svg>
            </div>
        </template>
    </Vue3EasyDataTable>
</template>
