<script setup>
import { ref, onMounted, computed } from "vue";
import Permissions from "../../components/dashboard/Permissions.vue";
import { getPermissions } from "../../services/permissoinsService";
import { storePermission } from "../../services/permissoinsService";
import { updatePermission } from "../../services/permissoinsService";
import { deletePermission } from "../../services/permissoinsService";
import { handleApiError } from '../../helpers/handleApiError'
import { showErrorAlert } from '../../helpers/swal'
import Swal from 'sweetalert2'
import { useI18n } from 'vue-i18n'
import { Modal } from "bootstrap"


const { t } = useI18n();
const loading = ref(false);
const permissions = ref([]);
const allRoles = ref([]);
const searchQuery = ref("");
const roleFilter = ref("");
const modalObject = ref(null);
const permissionName = ref(null);
const errorsMessage = ref(null);
const modalTitle = ref(null);
const editingPermissionId = ref(null);

const fetchPermissions = async () => {
    try {
        loading.value = true;
        const response = await getPermissions();
        permissions.value = response.data.permissions;
        if (response.data.roles) {
            allRoles.value = response.data.roles;
        } else {
            const roleMap = new Map();
            permissions.value.forEach((permission) => {
                const items = Array.isArray(permission.roles)
                    ? permission.roles
                    : permission.roles
                        ? [permission.roles]
                        : [];
                items.forEach((role) => {
                    if (role?.id) {
                        roleMap.set(role.id, role);
                    }
                });
            });
            allRoles.value = Array.from(roleMap.values());
        }
    } catch (error) {
        showErrorAlert(handleApiError(error, t));
    } finally {
        loading.value = false;
    }
}
onMounted(() => {
    modalTitle.value = t("add");
    fetchPermissions();
});
const openModal = () => {
    const modalEl = document.getElementById("permissionModal")
    modalObject.value = new Modal(modalEl)
    editingPermissionId.value = null;
    modalObject.value.show()
}
const closeModal = () => {
    if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur()
    }
    modalObject.value.hide()
}
const savePermission = async () => {
    try {
        if (permissionName.value != null) {
            loading.value = true
            if (editingPermissionId.value) {
                await updatePermission(editingPermissionId.value, { name: permissionName.value })
            } else {
                await storePermission({ name: permissionName.value })
            }
            permissionName.value = "";
            editingPermissionId.value = null;
            modalObject.value.hide()
            // refresh table
            fetchPermissions()
        } else {
            errorsMessage.value = "Name is required";
        }
    } catch (error) {
        showErrorAlert(handleApiError(error, t));
    } finally {
        loading.value = false
    }
}
const handlePermissionData = (data) => {
    const modalEl = document.getElementById("permissionModal")
    modalObject.value = new Modal(modalEl)
    permissionName.value = data.name;
    editingPermissionId.value = data.id;
    modalTitle.value = t("edit");
    modalObject.value.show();
};
const handleDeletePermission = async (id) => {
    const result = await Swal.fire({
        title: t('are_you_sure'),
        text: t('delete_permission_confirm'),
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
            await deletePermission(id);
            fetchPermissions();
        } catch (error) {
            showErrorAlert(handleApiError(error, t));
        } finally {
            loading.value = false;
        }
    }
};

const filteredPermissions = computed(() => {
    let list = permissions.value || [];
    const query = searchQuery.value.trim().toLowerCase();

    if (query) {
        list = list.filter((permission) => {
            const name = String(permission.name || "").toLowerCase();
            const id = String(permission.id || "");
            return name.includes(query) || id.includes(query);
        });
    }

    if (roleFilter.value) {
        list = list.filter((permission) => {
            const items = Array.isArray(permission.roles)
                ? permission.roles
                : permission.roles
                    ? [permission.roles]
                    : [];
            return items.some((role) => String(role.id) === String(roleFilter.value));
        });
    }

    return list;
});

</script>
<template>

    <div class="row">
        <div class="col-lg-6 col-md-6 col-sm-6">
            <h3>{{ $t('permissions') }}</h3>
        </div>
        <div class="col-lg-6 col-md-6 col-sm-6 d-flex justify-content-end">
            <button class="btn btn-primary" @click="openModal">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                    stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add
            </button>
        </div>
        <div class="col-lg-12 col-md-12 col-sm-12 mt-2">
            <div class="row mb-3">
                <div class="col-lg-6 col-md-6 col-sm-12 mb-2">
                    <input
                        type="text"
                        class="form-control"
                        placeholder="Search permissions..."
                        v-model="searchQuery"
                    />
                </div>
                <div class="col-lg-6 col-md-6 col-sm-12 mb-2">
                    <select class="form-control" v-model="roleFilter">
                        <option value="">All Roles</option>
                        <option v-for="role in allRoles" :key="role.id" :value="role.id">
                            {{ role.name }}
                        </option>
                    </select>
                </div>
            </div>
            <Permissions :permissions="filteredPermissions" :loading="loading" @permissionData="handlePermissionData" @deletePermission="handleDeletePermission" />
        </div>

    </div>
    <div class="modal fade" id="permissionModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">

                <div class="modal-header">
                    <h5 class="modal-title">{{ modalTitle }} Permission</h5>

                    <button type="button" class="close" data-dismiss="modal" aria-label="Close" @click="closeModal">
                        <span aria-hidden="true">×</span>
                    </button>
                </div>

                <div class="modal-body">

                    <!-- Permission Name -->
                    <div class="mb-3">
                        <label class="form-label">Name</label>

                        <input type="text" class="form-control" v-model="permissionName" />

                        <span class="text-danger" v-if="errorsMessage">
                            {{ errorsMessage }}
                        </span>
                    </div>

                </div>

                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="closeModal">
                        Cancel
                    </button>

                    <button class="btn btn-primary" :disabled="loading" @click="savePermission">
                        {{ loading ? "Saving..." : "Save" }}
                    </button>
                </div>

            </div>
        </div>
    </div>
</template>