<script setup>
import RolePermissions from '../../components/dashboard/RolePermissions.vue';
import { gerRolePermissions, storeRolePermissions } from '../../services/roleService'
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { showErrorAlert } from '../../helpers/swal';
import { handleApiError } from '../../helpers/handleApiError';
import { hasRoleId } from '../../helpers/authHelper';
import { useI18n } from 'vue-i18n';
import { useToast } from '../../helpers/useToast';
import { useAuthStore } from '../../stores/authStore';
import { storeToRefs } from 'pinia';

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const rolePermissions = ref([]);
const loading = ref(false);
const saving = ref(false);
const route = useRoute();
const { toast } = useToast();
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
        const response = await storeRolePermissions({
            roleId: Number(id),
            permissionIds,
        });
        toast(t(response.data.message));
        updateUserPermissionsForRole(permissionIds);
    } catch (error) {
        showErrorAlert(handleApiError(error, t));
    } finally {
        saving.value = false;
    }
};

const updateUserPermissionsForRole = (permissionIds) => {
    if (!hasRoleId(id)) {
        return;
    }

    const existingPermissions = Array.isArray(authStore.allPermissions)
        ? authStore.allPermissions
        : [];
    const oldRolePermissionNames = rolePermissions.value.map(
        (permission) => permission.name
    );

    const newRolePermissionNames = rolePermissions.value
        .filter((permission) => permissionIds.includes(permission.id))
        .map((permission) => permission.name);

    const filteredPermissions = existingPermissions.filter(
        (permissionName) => !oldRolePermissionNames.includes(permissionName)
    );

    const mergedPermissions = Array.from(
        new Set([...filteredPermissions, ...newRolePermissionNames])
    );
    authStore.setPermissions(mergedPermissions);
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
                        <h4 class="card-title">{{ $t('role_permissions') }}</h4>
                    </div>
                </div>
                <div class="card-body">
                    <div class="row">
                        <RolePermissions :rolePermissions="rolePermissions" :loading="loading" :saving="saving"
                            @savePermissions="saveRolePermissions" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>