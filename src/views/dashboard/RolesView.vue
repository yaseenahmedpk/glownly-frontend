<script setup>
import { ref, onMounted, reactive } from "vue";
import Roles from "../../components/dashboard/Roles.vue";
import { getRoles } from "../../services/roleService";
import { storeRole } from "../../services/roleService";
import { updateRole } from "../../services/roleService";
import { deleteRole } from "../../services/roleService";
import { handleApiError } from '../../helpers/handleApiError'
import { showErrorAlert } from '../../helpers/swal'
import Swal from 'sweetalert2'
import { useI18n } from 'vue-i18n'
import { Modal } from "bootstrap"
import { hasRole, hasPermission } from "../../helpers/authHelper";


const { t } = useI18n();
const loading = ref(false);
const roles = ref([]);
const modalObject = ref(null);
const roleName = ref(null);
const isPublic = ref(false);
const errorsMessage = ref(null);
const editingRoleId = ref(null);
const modalTitle = ref(null);

const fetchRoles = async () => {
    try {
        loading.value = true;
        const response = await getRoles();
        roles.value = response.data.roles;
    } catch (error) {
        showErrorAlert(handleApiError(error, t));
    } finally {
        loading.value = false;
    }
}
onMounted(() => {
    modalTitle.value = t("add");
    fetchRoles();
});
const openModal = () => {
    const modalEl = document.getElementById("roleModal")
    modalObject.value = new Modal(modalEl)
    editingRoleId.value = null;
    roleName.value = null;
    isPublic.value = false;
    modalTitle.value = t("add");
    modalObject.value.show()
}
const closeModal = () => {
    if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur()
    }
    modalObject.value.hide()
}
const saveRole = async () => {
    try {
        if (roleName.value != null) {
            loading.value = true
            const payload = {
                name: roleName.value,
                is_public: isPublic.value,
            }

            if (editingRoleId.value) {
                await updateRole(editingRoleId.value, payload)
            } else {
                await storeRole(payload)
            }
            roleName.value = "";
            isPublic.value = false;
            editingRoleId.value = null;
            modalObject.value.hide()
            // refresh table
            fetchRoles()
        } else {
            errorsMessage.value = "Name is required";
        }
    } catch (error) {
        showErrorAlert(handleApiError(error, t));
    } finally {
        loading.value = false
    }
}
const handleRoleData = (data) => {
    console.log(data.is_public ?? false);
    const modalEl = document.getElementById("roleModal")
    modalObject.value = new Modal(modalEl)
    roleName.value = data.name;
    isPublic.value = data.is_public == 1 ? true : false;
    editingRoleId.value = data.id;
    modalTitle.value = t("edit");
    modalObject.value.show();
};
const handleDeleteRole = async (id) => {
    const result = await Swal.fire({
        title: t('are_you_sure'),
        text: t('delete_role_confirm'),
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
            await deleteRole(id);
            fetchRoles();
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
                        <h4 class="card-title">{{ $t('roles') }}</h4>
                    </div>
                    <div class="header-action">
                        <button class="btn btn-primary" @click="openModal">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" fill="none" viewBox="0 0 24 24"
                                stroke-width="1.5" stroke="currentColor" class="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            {{ $t('add') }}
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <Roles :roles="roles" :loading="loading" @roleData="handleRoleData"
                        @deleteRole="handleDeleteRole" />
                </div>
            </div>
        </div>

    </div>
    <div class="modal fade" id="roleModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">

                <div class="modal-header">
                    <h5 class="modal-title">{{ modalTitle }} Role</h5>

                    <button type="button" class="close" data-dismiss="modal" aria-label="Close" @click="closeModal">
                        <span aria-hidden="true">×</span>
                    </button>
                </div>

                <div class="modal-body">

                    <!-- Permission Name -->
                    <div class="mb-3">
                        <label class="form-label">Name</label>
                        <input type="text" class="form-control" v-model="roleName" />
                        <span class="text-danger" v-if="errorsMessage">
                            {{ errorsMessage }}
                        </span>
                    </div>
                    <div class="mb-3" v-if="hasPermission('can_add_public_role')">
                        <div class="custom-control custom-checkbox custom-checkbox-color-check custom-control-inline">
                            <input type="checkbox" class="custom-control-input bg-primary" id="customCheck-1"
                                v-model="isPublic">
                            <label class="custom-control-label" for="customCheck-1"> {{ $t('is_public') }}</label>
                        </div>
                        <span class="text-danger" v-if="errorsMessage">
                            {{ errorsMessage }}
                        </span>
                    </div>

                </div>

                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="closeModal">
                        Cancel
                    </button>

                    <button class="btn btn-primary" :disabled="loading" @click="saveRole">
                        {{ loading ? "Saving..." : "Save" }}
                    </button>
                </div>

            </div>
        </div>
    </div>
</template>