<script setup>
import RolePermissions from '../../components/dashboard/RolePermissions.vue';
import { gerRolePermissions, storeRolePermissions } from '../../services/roleService'
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { showErrorAlert } from '../../helpers/swal';
import { handleApiError } from '../../helpers/handleApiError';
import { useI18n } from 'vue-i18n';

const rolePermissions = ref([]);
const loading = ref(false);
const saving = ref(false);
const route = useRoute();
const { t } = useI18n();
const id = route.params.id;

const fetchrolePermissions = async () => {
    try {
        loading.value = true;
        const response = await gerRolePermissions(id);
        rolePermissions.value = response.data.permissions;
    } catch (error) {
        showErrorAlert(handleApiError(error, t));
    } finally {
        loading.value = false;
    }
}
const saveRolePermissions = async (permissionIds) => {
    try {
        saving.value = true;
        await storeRolePermissions({
            roleId: Number(id),
            permissionIds,
        });
    } catch (error) {
        showErrorAlert(handleApiError(error, t));
    } finally {
        saving.value = false;
    }
};

onMounted(() => {
    fetchrolePermissions();
});
</script>
<template>
    <div class="row">
        <div class="col-sm-12 col-lg-12">
            <div class="card">
                <div class="card-header d-flex justify-content-between">
                    <div class="header-title">
                        <h4 class="card-title">Role Permissions</h4>
                    </div>
                </div>
                <div class="card-body">
                    <div class="row">
                        <RolePermissions :rolePermissions="rolePermissions" :loading="loading" :saving="saving" @savePermissions="saveRolePermissions" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>