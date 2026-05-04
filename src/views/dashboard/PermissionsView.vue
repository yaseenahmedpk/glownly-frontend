<script setup>
import { ref, onMounted } from "vue";
import Permissions from "../../components/dashboard/Permissions.vue";
import { getPermissions } from "../../services/permissoinsService";
import { handleApiError } from '../../helpers/handleApiError'
import { showErrorAlert } from '../../helpers/swal'
import { useI18n } from 'vue-i18n'

const { t } = useI18n();
const permissions = ref([]);
const fetchPermissions = async () => {
    // try {
    const response = await getPermissions();
    permissions.value = response.data.permissions;
    // } catch (error) {
    // showErrorAlert(handleApiError(error, t));
    // }
}
onMounted(() => {
    fetchPermissions();
});
</script>
<template>
    <div class="row">
        <div class="col-lg-6 col-md-6 col-sm-6">
            <h3>Permissions</h3>
        </div>
        <div class="col-lg-6 col-md-6 col-sm-6 d-flex justify-content-end">
            <button class="btn btn-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                    stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Action
            </button>
        </div>
        <div class="col-lg-12 col-md-12 col-sm-12">
            <Permissions :permissions="permissions" />
        </div>

    </div>
</template>