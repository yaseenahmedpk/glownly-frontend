<script setup>
import { ref, onMounted, reactive } from "vue";
import Roles from "../../components/dashboard/Roles.vue";
import { getRoles } from "../../services/roleService";
import { storeRole } from "../../services/roleService";
import { handleApiError } from '../../helpers/handleApiError'
import { showErrorAlert } from '../../helpers/swal'
import { useI18n } from 'vue-i18n'
import { Modal } from "bootstrap"


const { t } = useI18n();
const loading = ref(false);
const roles = ref([]);
const modalObject = ref(null);
const roleName = ref(null);
const errorsMessage = ref(null);

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
    fetchRoles();
});
const openModal = () => {
    const modalEl = document.getElementById("roleModal")
    modalObject.value = new Modal(modalEl)
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
            await storeRole({ name: roleName.value })
            roleName.value = "";
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
</script>
<template>

    <div class="row">
        <div class="col-lg-6 col-md-6 col-sm-6">
            <h3>Roles</h3>
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
            <Roles :roles="roles" :loading="loading" />
        </div>

    </div>
    <div class="modal fade" id="roleModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">

                <div class="modal-header">
                    <h5 class="modal-title">Add Role</h5>

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