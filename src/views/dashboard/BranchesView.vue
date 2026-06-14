<script setup>
import { ref, onMounted } from "vue";
import Branches from "../../components/dashboard/Branches.vue";
import { getBranches, getNewBranchCode, storeBranch, updateBranch, deleteBranch } from "../../services/branchService";
import { getStates } from "../../services/authService";
import { handleApiError } from '../../helpers/handleApiError'
import { showErrorAlert } from '../../helpers/swal'
import Swal from 'sweetalert2'
import { useI18n } from 'vue-i18n'
import { Modal } from "bootstrap"
import { useAuthStore } from '../../stores/authStore'
import { useToast } from '../../helpers/useToast'

const { t } = useI18n();
const loading = ref(false);
const branches = ref([]);
const countries = ref([]);
const states = ref([]);
const modalObject = ref(null);
const modalTitle = ref(null);
const editingBranchId = ref(null);
const authStore = useAuthStore();
const { toast } = useToast();

const formData = ref({
    name: '',
    code: '',
    phone: '',
    email: '',
    country_id: '',
    state_id: '',
    city: '',
    postcode: '',
    address_line_1: '',
    address_line_2: '',
    latitude: '',
    longitude: '',
    opening_time: '',
    closing_time: '',
    is_main_branch: false
});

const timeOptions = ref([]);

const generateTimeOptions = () => {
    const times = [];
    for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m += 30) {
            const hh = String(h).padStart(2, '0');
            const mm = String(m).padStart(2, '0');
            times.push(`${hh}:${mm}`);
        }
    }
    timeOptions.value = times;
};

const fetchBranches = async () => {
    try {
        loading.value = true;
        const companyId = authStore.company?.id;
        const response = await getBranches(companyId);
        const data = response.data.branches || response.data || [];
        branches.value = Array.isArray(data) ? data : [];
        if (response.data.countries) countries.value = response.data.countries;
        if (response.data.states) states.value = response.data.states;
    } catch (error) {
        showErrorAlert(handleApiError(error, t));
    } finally {
        loading.value = false;
    }
}

onMounted(() => {
    modalTitle.value = t("add");
    generateTimeOptions();
    fetchBranches();
});

const openModal = async () => {
    const modalEl = document.getElementById("branchModal")
    modalObject.value = new Modal(modalEl)
    editingBranchId.value = null;
    resetForm();
    modalTitle.value = t("add");
    const companyId = authStore.company?.id;
    if (companyId) {
        try {
            const res = await getNewBranchCode(companyId);
            formData.value.code = res.data.branch_code || '';
        } catch (_) {}
    }
    modalObject.value.show()
}

const resetForm = () => {
    formData.value = {
        name: '',
        code: '',
        phone: '',
        email: '',
        country_id: '',
        state_id: '',
        city: '',
        postcode: '',
        address_line_1: '',
        address_line_2: '',
        opening_time: '',
        closing_time: '',
        is_main_branch: false
    };
    states.value = [];
}

const closeModal = () => {
    if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur()
    }
    modalObject.value.hide()
}

const saveBranch = async () => {
    try {
        loading.value = true
        const payload = { ...formData.value };
        payload.business_id = authStore.company?.id;
        let response;
        if (editingBranchId.value) {
            response = await updateBranch(editingBranchId.value, payload)
        } else {
            response = await storeBranch(payload)
        }
        modalObject.value.hide()
        toast(t(response.data.message))
        fetchBranches()
    } catch (error) {
        showErrorAlert(handleApiError(error, t));
    } finally {
        loading.value = false
    }
}

const handleBranchData = async (data) => {
    const modalEl = document.getElementById("branchModal")
    modalObject.value = new Modal(modalEl)
    formData.value = {
        name: data.name || '',
        code: data.code || '',
        phone: data.phone || '',
        email: data.email || '',
        country_id: data.country_id || '',
        state_id: data.state_id || '',
        city: data.city || '',
        postcode: data.postcode || '',
        address_line_1: data.address_line_1 || '',
        address_line_2: data.address_line_2 || '',
        opening_time: (data.opening_time || '').slice(0, 5),
        closing_time: (data.closing_time || '').slice(0, 5),
        is_main_branch: !!data.is_main_branch
    };
    editingBranchId.value = data.id;
    modalTitle.value = t("edit");

    // Load states for the selected country when editing
    if (data.country_id) {
        await fetchStatesForCountry(data.country_id);
    }

    modalObject.value.show();
};

const handleQrCodeUpdated = (branchId, newQrCodeUrl) => {
    branches.value = branches.value.map(branch => 
        branch.id === branchId 
            ? { ...branch, qr_code_url: newQrCodeUrl }
            : branch
    );
};

const handleDeleteBranch = async (id) => {
    const result = await Swal.fire({
        title: t('are_you_sure'),
        text: t('delete_branch_confirm') || 'Delete this branch?',
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
            const response = await deleteBranch(id);
            toast(t(response.data.message))
            fetchBranches();
        } catch (error) {
            showErrorAlert(handleApiError(error, t));
        } finally {
            loading.value = false;
        }
    }
};

const fetchStatesForCountry = async (countryId) => {
    if (!countryId) {
        states.value = [];
        formData.value.state_id = '';
        return;
    }
    try {
        const response = await getStates(countryId);
        states.value = response.data || [];
    } catch (error) {
        states.value = [];
    }
};

const onCountryChange = async () => {
    await fetchStatesForCountry(formData.value.country_id);
};
</script>

<template>
    <div class="row">
        <div class="col-lg-6 col-md-6 col-sm-6">
            <h3>{{ $t('branches') }}</h3>
        </div>
        <div class="col-lg-6 col-md-6 col-sm-6 d-flex justify-content-end">
            <button class="btn btn-primary" @click="openModal">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                    stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                {{ $t('add') }}
            </button>
        </div>
        <div class="col-lg-12 col-md-12 col-sm-12 mt-2">
            <Branches :branches="branches" :loading="loading" @branchData="handleBranchData" @deleteBranch="handleDeleteBranch" @qrCodeUpdated="handleQrCodeUpdated" />
        </div>
    </div>

    <!-- Branch Modal -->
    <div class="modal fade" id="branchModal" tabindex="-1">
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">{{ modalTitle }} {{ $t('branch') || 'Branch' }}</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close" @click="closeModal">
                        <span aria-hidden="true">×</span>
                    </button>
                </div>

                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">{{ $t('name') || 'Name' }}</label>
                            <input type="text" class="form-control" v-model="formData.name" />
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">{{ $t('code') || 'Code' }}</label>
                            <input type="text" class="form-control" v-model="formData.code" />
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">{{ $t('phone') || 'Phone' }}</label>
                            <input type="text" class="form-control" v-model="formData.phone" />
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">{{ $t('email') || 'Email' }}</label>
                            <input type="email" class="form-control" v-model="formData.email" />
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label">{{ $t('country') || 'Country' }}</label>
                            <select class="form-control" v-model="formData.country_id" @change="onCountryChange">
                                <option value="">{{ $t('select_country') || 'Select Country' }}</option>
                                <option v-for="c in countries" :key="c.id" :value="c.id">{{ c.name }}</option>
                            </select>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">{{ $t('state') || 'State' }}</label>
                            <select class="form-control" v-model="formData.state_id">
                                <option value="">{{ $t('select_state') || 'Select State' }}</option>
                                <option v-for="s in states" :key="s.id" :value="s.id">{{ s.name }}</option>
                            </select>
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label">{{ $t('city') || 'City' }}</label>
                            <input type="text" class="form-control" v-model="formData.city" />
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">{{ $t('postcode') || 'Postcode' }}</label>
                            <input type="text" class="form-control" v-model="formData.postcode" />
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label">{{ $t('address_line_1') || 'Address Line 1' }}</label>
                            <input type="text" class="form-control" v-model="formData.address_line_1" />
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">{{ $t('address_line_2') || 'Address Line 2' }}</label>
                            <input type="text" class="form-control" v-model="formData.address_line_2" />
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label">{{ $t('opening_time') || 'Opening Time' }}</label>
                            <select class="form-control" v-model="formData.opening_time">
                                <option value="">{{ $t('select') || 'Select' }}</option>
                                <option v-for="t in timeOptions" :key="t" :value="t">{{ t }}</option>
                            </select>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">{{ $t('closing_time') || 'Closing Time' }}</label>
                            <select class="form-control" v-model="formData.closing_time">
                                <option value="">{{ $t('select') || 'Select' }}</option>
                                <option v-for="t in timeOptions" :key="t" :value="t">{{ t }}</option>
                            </select>
                        </div>

                        <div class="col-12 mb-3">
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="isMainBranch" v-model="formData.is_main_branch" />
                                <label class="form-check-label" for="isMainBranch">{{ $t('is_main_branch') || 'Is this the main branch?' }}</label>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="closeModal">{{ $t('cancel') }}</button>
                    <button class="btn btn-primary" :disabled="loading" @click="saveBranch">
                        {{ loading ? $t('saving') : $t('save') }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
