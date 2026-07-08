<script setup>
import { ref, onMounted } from "vue";
import Staff from "../../components/dashboard/Staff.vue";
import { getStaff, storeStaff, updateStaff, deleteStaff } from "../../services/staffService";
import { getRoles } from "../../services/roleService";
import { getBranches } from "../../services/branchService";
import { handleApiError } from '../../helpers/handleApiError'
import { showErrorAlert } from '../../helpers/swal'
import { useToast } from '../../helpers/useToast'
import Swal from 'sweetalert2'
import { useI18n } from 'vue-i18n'
import { Modal } from "bootstrap"
import { hasPermission } from "../../helpers/authHelper";
import { useAuthStore } from "../../stores/authStore";
import IntlTelInput from "intl-tel-input/vue";
import "intl-tel-input/styles";
import TagSelect from "../../components/form/TagSelect.vue";

const { t } = useI18n();
const { toast } = useToast();
const authStore = useAuthStore();
const loading = ref(false);
const staffList = ref([]);
const modalObject = ref(null);
const errorsMessage = ref(null);
const editingStaffId = ref(null);
const modalTitle = ref(null);
const rolesList = ref([]);
const branchesList = ref([]);
const invitationUrl = ref(null);
const invitationModalObject = ref(null);
const copied = ref(false);

const formData = ref({
    first_name: '',
    last_name: '',
    mobile_number: '',
    email: '',
    role_id: '',
    branch_ids: [],
});

const fetchStaff = async () => {
    try {
        loading.value = true;
        const businessId = authStore.company?.id;
        if (!businessId) return;
        const response = await getStaff(businessId);
        staffList.value = response.data.staff || [];
    } catch (error) {
        showErrorAlert(handleApiError(error, t));
    } finally {
        loading.value = false;
    }
};

const fetchRoles = async () => {
    try {
        loading.value = true;
        const response = await getRoles();
        rolesList.value = response.data.roles || [];
    } catch (error) {
        showErrorAlert(handleApiError(error, t));
    } finally {
        loading.value = false;
    }
};

const fetchBranches = async () => {
    try {
        loading.value = true;
        const companyId = authStore.company?.id;
        if (!companyId) return;
        const response = await getBranches(companyId);
        branchesList.value = response.data.branches || [];
    } catch (error) {
        showErrorAlert(handleApiError(error, t));
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    modalTitle.value = t("add");
    fetchStaff();
    fetchRoles();
    fetchBranches();
});

const openModal = () => {
    const modalEl = document.getElementById("staffModal")
    modalObject.value = new Modal(modalEl)
    editingStaffId.value = null;
    formData.value = {
        first_name: '',
        last_name: '',
        mobile_number: '',
        email: '',
        role_id: '',
        branch_ids: [],
    };
    errorsMessage.value = null;
    modalTitle.value = t("add");
    modalObject.value.show()
}

const closeModal = () => {
    if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur()
    }
    modalObject.value.hide()
}

const saveStaff = async () => {
    try {
        loading.value = true;
        const payload = { ...formData.value };
        if (editingStaffId.value) {
            await updateStaff(editingStaffId.value, payload);
            toast(t("saved_successfully"));
            closeModal();
            fetchStaff();
        } else {
            const businessId = authStore.company?.id;
            payload.business_id = businessId;
            const response = await storeStaff(payload);
            closeModal();
            fetchStaff();
            const url = response.data?.invitation_url;
            if (url) {
                invitationUrl.value = url;
                copied.value = false;
                const el = document.getElementById("invitationModal");
                invitationModalObject.value = new Modal(el);
                invitationModalObject.value.show();
            }
        }
    } catch (error) {
        showErrorAlert(handleApiError(error, t));
    } finally {
        loading.value = false;
    }
}

const copyInvitationLink = async () => {
    if (!invitationUrl.value) return;
    try {
        await navigator.clipboard.writeText(invitationUrl.value);
        copied.value = true;
        setTimeout(() => { copied.value = false; }, 2000);
    } catch {
        showErrorAlert(t("copy_failed"));
    }
};

const openInvitationModal = () => {
    const el = document.getElementById("invitationModal");
    invitationModalObject.value = new Modal(el);
    invitationModalObject.value.show();
};

const handleStaffData = (data) => {
    const modalEl = document.getElementById("staffModal")
    modalObject.value = new Modal(modalEl)
    formData.value = {
        first_name: data.user?.first_name || '',
        last_name: data.user?.last_name || '',
        mobile_number: data.user?.mobile_number || '',
        email: data.user?.email || '',
        role_id: data.user?.roles?.[0]?.id || '',
        branch_ids: data.branches?.map(b => b.id) || [],
    };
    editingStaffId.value = data.id;
    modalTitle.value = t("edit");
    modalObject.value.show();
};

const handleDeleteStaff = async (id) => {
    const result = await Swal.fire({
        title: t('are_you_sure'),
        text: t('delete_staff_confirm'),
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
            await deleteStaff(id);
            toast(t("staff_deleted_successfully"));
            fetchStaff();
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
                        <h4 class="card-title">{{ $t('staff') }}</h4>
                    </div>
                    <div class="header-action" v-if="hasPermission('can_add_employees')">
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
                    <Staff :staff="staffList" :loading="loading" @staffData="handleStaffData"
                        @deleteStaff="handleDeleteStaff" />
                </div>
            </div>
        </div>
    </div>
    <div class="modal fade" id="staffModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">{{ modalTitle }} {{ $t('staff') }}</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close" @click="closeModal">
                        <span aria-hidden="true">×</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="row g-3">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label class="form-label">{{ $t('first_name') }}</label>
                                <input type="text" class="form-control" v-model="formData.first_name" />
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label class="form-label">{{ $t('last_name') }}</label>
                                <input type="text" class="form-control" v-model="formData.last_name" />
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label class="form-label">{{ $t('mobile_number') }}</label>
                                <IntlTelInput
                                    v-model="formData.mobile_number"
                                    :inputProps="{
                                        class: 'form-control',
                                        placeholder: $t('enter_mobile_number')
                                    }"
                                    initial-country="auto"
                                    :load-utils="() => import('intl-tel-input/utils')"
                                />
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label class="form-label">{{ $t('email') }}</label>
                                <input type="email" class="form-control" v-model="formData.email" />
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label class="form-label">{{ $t('role') }}</label>
                                <TagSelect
                                    :modelValue="formData.role_id"
                                    @update:modelValue="formData.role_id = $event"
                                    :options="rolesList"
                                    :multiple="false"
                                    label="name"
                                    value="id"
                                    :placeholder="$t('select')"
                                />
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label class="form-label">{{ $t('branches') }}</label>
                                <TagSelect
                                    :modelValue="formData.branch_ids"
                                    @update:modelValue="formData.branch_ids = $event"
                                    :options="branchesList"
                                    :multiple="true"
                                    label="name"
                                    value="id"
                                    :placeholder="$t('select_branch')"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="closeModal">
                        {{ $t('cancel') }}
                    </button>
                    <button class="btn btn-primary" :disabled="loading" @click="saveStaff">
                        {{ loading ? t("saving") : t("save") }}
                    </button>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="invitationModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">{{ $t('staff_invitation_title') }}</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close" @click="closeModal">
                        <span aria-hidden="true">×</span>
                    </button>
                </div>
                <div class="modal-body">
                    <p>{{ $t('staff_registered_successfully_invitation_sent') }}</p>
                    <div class="input-group mb-3">
                        <input type="text" class="form-control" :value="invitationUrl" readonly />
                        <button class="btn btn-outline-secondary" type="button" @click="copyInvitationLink">
                            {{ copied ? $t('copied') : $t('copy') }}
                        </button>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" data-dismiss="modal" @click="closeModal">
                        {{ $t('close') }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
