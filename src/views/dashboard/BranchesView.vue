<script setup>
import { ref, onMounted, watch, nextTick } from "vue";
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
const branchFetchPromise = ref(null);

const shiftCount = ref(1);

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
    is_main_branch: false,
    shifts: []
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

watch(shiftCount, (newCount) => {
    formData.value.shifts = [];
    for (let i = 2; i <= newCount; i++) {
        formData.value.shifts.push({
            shift_number: i,
            opening_time: '',
            closing_time: ''
        });
    }
});

const fetchBranches = async () => {
    branchFetchPromise.value = (async () => {
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
            branchFetchPromise.value = null;
        }
    })();
    await branchFetchPromise.value;
};

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
        latitude: '',
        longitude: '',
        opening_time: '',
        closing_time: '',
        is_main_branch: false,
        shifts: []
    };
    shiftCount.value = 1;
    states.value = [];
}

const closeModal = () => {
    if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur()
    }
    modalObject.value.hide()
}

const validateShiftTimes = () => {
    if (!formData.value.opening_time || !formData.value.closing_time) {
        return {
            valid: false,
            message: t('please_select_shift_times', { number: 1 })
        };
    }
    for (let i = 0; i < formData.value.shifts.length; i++) {
        const shift = formData.value.shifts[i];
        if (!shift.opening_time || !shift.closing_time) {
            return {
                valid: false,
                message: t('please_select_shift_times', { number: shift.shift_number })
            };
        }
    }
    return { valid: true };
};

const saveBranch = async () => {
    const validation = validateShiftTimes();
    if (!validation.valid) {
        showErrorAlert(validation.message);
        return;
    }

    try {
        loading.value = true
        const payload = { ...formData.value };
        payload.business_id = authStore.company?.id;
        const shifts = [];
        if (formData.value.opening_time || formData.value.closing_time) {
            shifts.push({
                shift_no: 1,
                start_time: formData.value.opening_time,
                end_time: formData.value.closing_time
            });
        }
        formData.value.shifts.forEach(s => {
            shifts.push({
                shift_no: s.shift_number,
                start_time: s.opening_time,
                end_time: s.closing_time
            });
        });
        payload.shifts = shifts;
        delete payload.shiftCount;
        let response;
        if (editingBranchId.value) {
            response = await updateBranch(editingBranchId.value, payload)
        } else {
            response = await storeBranch(payload)
        }
        modalObject.value.hide()
        toast(t(response.data.message))
        branchFetchPromise.value = fetchBranches();
    } catch (error) {
        showErrorAlert(handleApiError(error, t));
    } finally {
        loading.value = false
    }
}

const handleBranchData = async (data) => {
    if (branchFetchPromise.value) {
        await branchFetchPromise.value;
    }

    const modalEl = document.getElementById("branchModal");
    modalObject.value = new Modal(modalEl);

    const branch = branches.value.find((b) => b.id === data.id) || data;
    const branchShifts = branch.branch_shifts || [];
    const numShifts = Math.max(branchShifts.length, 1);

    formData.value = {
        name: branch.name || '',
        code: branch.code || '',
        phone: branch.phone || '',
        email: branch.email || '',
        country_id: branch.country_id || '',
        state_id: branch.state_id || '',
        city: branch.city || '',
        postcode: branch.postcode || '',
        address_line_1: branch.address_line_1 || '',
        address_line_2: branch.address_line_2 || '',
        latitude: branch.latitude || '',
        longitude: branch.longitude || '',
        opening_time: '',
        closing_time: '',
        is_main_branch: !!branch.is_main_branch,
        shifts: []
    };

    formData.value.shifts = [];
    for (let i = 2; i <= numShifts; i++) {
        formData.value.shifts.push({
            shift_number: i,
            opening_time: '',
            closing_time: ''
        });
    }

    shiftCount.value = numShifts;
    editingBranchId.value = branch.id;
    modalTitle.value = t("edit");

    await nextTick();

    const primaryShift = branchShifts[0] || {};
    formData.value.opening_time = (primaryShift.start_time || branch.opening_time || '').slice(0, 5);
    formData.value.closing_time = (primaryShift.end_time || branch.closing_time || '').slice(0, 5);

    branchShifts.slice(1).forEach((s, i) => {
        if (formData.value.shifts[i]) {
            formData.value.shifts[i].opening_time = (s.start_time || '').slice(0, 5);
            formData.value.shifts[i].closing_time = (s.end_time || '').slice(0, 5);
        }
    });

    if (branch.country_id) {
        await fetchStatesForCountry(branch.country_id);
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

const getShiftLabel = (shiftNumber) => {
    return t('shift_number', { number: shiftNumber });
};
</script>

<template>
    <div class="branches-view">
        <div class="row align-items-center mb-4">
            <div class="col-lg-6 col-md-6">
                <h3 class="page-title">{{ $t('branches') }}</h3>
            </div>
            <div class="col-lg-6 col-md-6 d-flex justify-content-end">
                <button class="btn btn-primary btn-add-branch" @click="openModal">
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
        <div class="modal fade branch-modal" id="branchModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-xl modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <div class="modal-header-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3.75a.75.75 0 0 1 .75.75V21m-4.5 0H2.25m16.5 0a48.474 48.474 0 0 0-3.75-.94c-4.97 0-9.216 1.984-12.336 5.41A46.74 46.74 0 0 0 2.25 21m16.5 0c.844.242 1.647.544 2.4.88M2.25 21h19.5M2.25 21V12m0 0a48.36 48.36 0 0 1 3.823-.938m-3.823.938A48.337 48.337 0 0 0 2.25 12m19.5 0V6.375c0-.621-.504-1.125-1.125-1.125H4.125C3.504 5.25 3 5.754 3 6.375v5.625m0 0c0 .621.504 1.125 1.125 1.125h19.5M2.25 12v9" />
                            </svg>
                        </div>
                        <h5 class="modal-title">{{ modalTitle }} {{ $t('branch') || 'Branch' }}</h5>
                        <button type="button" class="btn btn-icon btn-close-modal" data-dismiss="modal" aria-label="Close" @click="closeModal">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div class="modal-body">
                        <form @submit.prevent="saveBranch">
                            <!-- Basic Information Section -->
                            <div class="form-section">
                                <div class="section-header">
                                    <div class="section-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                        </svg>
                                    </div>
                                    <h6 class="section-title">{{ $t('basic_information') || 'Basic Information' }}</h6>
                                </div>
                                <div class="section-body">
                                    <div class="row g-3">
                                        <div class="col-md-6">
                                            <label class="form-label">{{ $t('name') || 'Name' }} <span class="required">*</span></label>
                                            <input type="text" class="form-control" v-model="formData.name" :placeholder="$t('enter_name') || 'Enter branch name'" />
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label">{{ $t('code') || 'Code' }}</label>
                                            <input type="text" class="form-control" v-model="formData.code" readonly />
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label">{{ $t('phone') || 'Phone' }} <span class="required">*</span></label>
                                            <input type="text" class="form-control" v-model="formData.phone" :placeholder="$t('enter_phone') || 'Enter phone number'" />
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label">{{ $t('email') || 'Email' }}</label>
                                            <input type="email" class="form-control" v-model="formData.email" :placeholder="$t('enter_email') || 'Enter email address'" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Location Section -->
                            <div class="form-section">
                                <div class="section-header">
                                    <div class="section-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                                        </svg>
                                    </div>
                                    <h6 class="section-title">{{ $t('address') || 'Location' }}</h6>
                                </div>
                                <div class="section-body">
                                    <div class="row g-3">
                                        <div class="col-md-6">
                                            <label class="form-label">{{ $t('country') || 'Country' }} <span class="required">*</span></label>
                                            <select class="form-select" v-model="formData.country_id" @change="onCountryChange">
                                                <option value="">{{ $t('select_country') || 'Select Country' }}</option>
                                                <option v-for="c in countries" :key="c.id" :value="c.id">{{ c.name }}</option>
                                            </select>
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label">{{ $t('state') || 'State' }} <span class="required">*</span></label>
                                            <select class="form-select" v-model="formData.state_id">
                                                <option value="">{{ $t('select_state') || 'Select State' }}</option>
                                                <option v-for="s in states" :key="s.id" :value="s.id">{{ s.name }}</option>
                                            </select>
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label">{{ $t('city') || 'City' }} <span class="required">*</span></label>
                                            <input type="text" class="form-control" v-model="formData.city" :placeholder="$t('enter_city') || 'Enter city'" />
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label">{{ $t('postcode') || 'Postcode' }}</label>
                                            <input type="text" class="form-control" v-model="formData.postcode" :placeholder="$t('enter_postcode') || 'Enter postcode'" />
                                        </div>
                                        <div class="col-12">
                                            <label class="form-label">{{ $t('address_line_1') || 'Address Line 1' }} <span class="required">*</span></label>
                                            <input type="text" class="form-control" v-model="formData.address_line_1" :placeholder="$t('enter_address_line_1') || 'Enter address line 1'" />
                                        </div>
                                        <div class="col-12">
                                            <label class="form-label">{{ $t('address_line_2') || 'Address Line 2' }}</label>
                                            <input type="text" class="form-control" v-model="formData.address_line_2" :placeholder="$t('enter_address_line_2') || 'Enter address line 2 (optional)'" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Operating Hours Section -->
                            <div class="form-section">
                                <div class="section-header">
                                    <div class="section-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                        </svg>
                                    </div>
                                    <h6 class="section-title">{{ $t('operating_hours') || 'Operating Hours' }}</h6>
                                </div>
                                <div class="section-body">
                                    <div class="row g-3 mb-3">
                                        <div class="col-md-12">
                                            <label class="form-label">{{ $t('number_of_shifts') || 'Number of Shifts' }}</label>
                                            <select class="form-select form-select-shift" v-model="shiftCount">
                                                <option v-for="n in 10" :key="n" :value="n">{{ n }} {{ $t('shift') || 'Shift' }}</option>
                                            </select>
                                            <div class="shift-badge" v-if="shiftCount > 1">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                                                </svg>
                                                {{ $t('select_shifts') || 'Configure opening and closing times for each shift below' }}
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Shift 1 (Primary) -->
                                    <div class="shift-card shift-card-primary" :class="{ 'shift-card-single': shiftCount === 1 }">
                                        <div class="shift-card-header">
                                            <div class="shift-badge-number shift-badge-primary">1</div>
                                            <span class="shift-label">{{ getShiftLabel(1) }} <span class="text-muted-custom">({{ $t('primary') || 'Primary' }})</span></span>
                                        </div>
                                        <div class="shift-card-body">
                                            <div class="row g-3">
                                                <div class="col-md-6">
                                                    <label class="form-label">{{ $t('shift_opening_time') || 'Opening Time' }} <span class="required">*</span></label>
                                                    <div class="time-input-wrapper">
                                                        <select class="form-select time-select" v-model="formData.opening_time">
                                                            <option value="">{{ $t('select') || 'Select' }}</option>
                                                            <option v-for="t in timeOptions" :key="'o1-'+t" :value="t">{{ t }}</option>
                                                        </select>
                                                        <div class="time-icon">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="col-md-6">
                                                    <label class="form-label">{{ $t('shift_closing_time') || 'Closing Time' }} <span class="required">*</span></label>
                                                    <div class="time-input-wrapper">
                                                        <select class="form-select time-select" v-model="formData.closing_time">
                                                            <option value="">{{ $t('select') || 'Select' }}</option>
                                                            <option v-for="t in timeOptions" :key="'c1-'+t" :value="t">{{ t }}</option>
                                                        </select>
                                                        <div class="time-icon">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Additional Shifts (2+) -->
                                    <template v-if="shiftCount > 1">
                                        <div class="shift-divider"></div>
                                        <div class="shift-card" v-for="(shift, index) in formData.shifts" :key="shift.shift_number">
                                            <div class="shift-card-header">
                                                <div class="shift-badge-number">{{ shift.shift_number }}</div>
                                                <span class="shift-label">{{ getShiftLabel(shift.shift_number) }}</span>
                                            </div>
                                            <div class="shift-card-body">
                                                <div class="row g-3">
                                                    <div class="col-md-6">
                                                        <label class="form-label">{{ $t('shift_opening_time') || 'Opening Time' }} <span class="required">*</span></label>
                                                        <div class="time-input-wrapper">
                                                            <select class="form-select time-select" v-model="formData.shifts[index].opening_time">
                                                                <option value="">{{ $t('select') || 'Select' }}</option>
                                                                <option v-for="t in timeOptions" :key="'o'+shift.shift_number+t" :value="t">{{ t }}</option>
                                                            </select>
                                                            <div class="time-icon">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="col-md-6">
                                                        <label class="form-label">{{ $t('shift_closing_time') || 'Closing Time' }} <span class="required">*</span></label>
                                                        <div class="time-input-wrapper">
                                                            <select class="form-select time-select" v-model="formData.shifts[index].closing_time">
                                                                <option value="">{{ $t('select') || 'Select' }}</option>
                                                                <option v-for="t in timeOptions" :key="'c'+shift.shift_number+t" :value="t">{{ t }}</option>
                                                            </select>
                                                            <div class="time-icon">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </template>
                                </div>
                            </div>

                            <!-- Main Branch Toggle -->
                            <div class="form-section">
                                <div class="section-body">
                                    <div class="form-check-toggle">
                                        <input type="checkbox" class="form-check-input" id="isMainBranch" v-model="formData.is_main_branch" />
                                        <label class="form-check-label" for="isMainBranch">{{ $t('is_main_branch') || 'Is this the main branch?' }}</label>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary btn-cancel" @click="closeModal">{{ $t('cancel') }}</button>
                        <button class="btn btn-primary btn-save" :disabled="loading" @click="saveBranch">
                            <span v-if="loading" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                            {{ loading ? $t('saving') : $t('save') }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.branches-view {
  position: relative;
}

.page-title {
  color: #1A1A2E;
  font-weight: 700;
  font-size: 26px;
  margin: 0;
}

.btn-add-branch {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 22px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  background: #9A77BC;
  border: none;
  color: #fff;
  box-shadow: 0 2px 8px rgba(154, 119, 188, 0.3);
  transition: all 0.2s ease;
}

.btn-add-branch:hover {
  background: #8A69AC;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(154, 119, 188, 0.4);
  color: #fff;
}

.branch-modal .modal-dialog {
  max-width: 960px;
}

.branch-modal .modal-content {
  border: none;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 4px 16px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.branch-modal .modal-header {
  background: linear-gradient(135deg, #9A77BC 0%, #7B5F9E 100%);
  color: #fff;
  padding: 18px 24px;
  border-bottom: none;
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-header-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.modal-header-icon svg {
  color: #fff;
}

.branch-modal .modal-title {
  color: #fff;
  font-weight: 700;
  font-size: 18px;
  margin: 0;
  flex: 1;
}

.btn-close-modal {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.2s ease;
  color: #fff;
}

.btn-close-modal:hover {
  background: rgba(255, 255, 255, 0.3);
}

.branch-modal .modal-body {
  padding: 24px;
  max-height: 65vh;
  overflow-y: auto;
  background: #F9FAFB;
}

.branch-modal .modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #E5E7EB;
  background: #fff;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* Form Sections */
.form-section {
  background: #fff;
  border-radius: 14px;
  border: 1px solid #E5E7EB;
  margin-bottom: 16px;
  overflow: hidden;
  transition: box-shadow 0.2s ease;
}

.form-section:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  background: #F8F9FB;
  border-bottom: 1px solid #E5E7EB;
}

.section-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(154, 119, 188, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.section-icon svg {
  color: #9A77BC;
}

.section-title {
  margin: 0;
  font-weight: 700;
  font-size: 14px;
  color: #1A1A2E;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.section-body {
  padding: 20px;
}

/* Form Controls */
.form-label {
  display: block;
  font-weight: 600;
  font-size: 13px;
  color: #374151;
  margin-bottom: 6px;
}

.required {
  color: #E74C3C;
  font-weight: 700;
}

.text-muted-custom {
  color: #9CA3AF;
  font-weight: 400;
  font-size: 12px;
}

.form-control,
.form-select {
  border: 1.5px solid #E5E7EB;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 14px;
  background-color: #fff;
  color: #1A1A2E;
  min-height: 42px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
  width: 100%;
}

.form-control:focus,
.form-select:focus {
  border-color: #9A77BC;
  box-shadow: 0 0 0 3px rgba(154, 119, 188, 0.15);
  outline: none;
}

.form-control::placeholder {
  color: #B0B7C3;
}

/* Shift Controls */
.form-select-shift {
  border-color: #D1D5DB;
  font-weight: 600;
  color: #9A77BC;
  max-width: 200px;
}

.shift-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 6px 12px;
  background: rgba(154, 119, 188, 0.08);
  border: 1px solid rgba(154, 119, 188, 0.2);
  border-radius: 8px;
  font-size: 12px;
  color: #9A77BC;
  font-weight: 500;
}

.shift-badge svg {
  color: #9A77BC;
}

/* Shift Cards */
.shift-card {
  background: #fff;
  border: 1.5px solid #E5E7EB;
  border-radius: 12px;
  margin-bottom: 12px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.shift-card:hover {
  border-color: #D1D5DB;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.shift-card-primary {
  border-color: rgba(154, 119, 188, 0.3);
  background: rgba(154, 119, 188, 0.02);
}

.shift-card-single {
  border-color: rgba(154, 119, 188, 0.3);
}

.shift-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #F8F9FB;
  border-bottom: 1px solid #E5E7EB;
}

.shift-badge-number {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(154, 119, 188, 0.15);
  color: #9A77BC;
  font-weight: 700;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.shift-badge-primary {
  background: #9A77BC;
  color: #fff;
}

.shift-label {
  font-weight: 600;
  font-size: 14px;
  color: #1A1A2E;
}

.shift-card-body {
  padding: 16px;
}

.shift-divider {
  height: 1px;
  background: linear-gradient(to right, transparent, #D1D5DB, transparent);
  margin: 16px 0;
}

/* Time Input */
.time-input-wrapper {
  position: relative;
}

.time-select {
  padding-right: 40px;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%239A77BC' viewBox='0 0 16 16'%3E%3Cpath d='M4.646 5.646a.5.5 0 0 1 .708 0L8 8.293l2.646-2.647a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 0 1 0-.708z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
}

.time-icon {
  position: absolute;
  right: 36px;
  top: 50%;
  transform: translateY(-50%);
  color: #9CA3AF;
  pointer-events: none;
  z-index: 2;
}

/* Checkbox */
.form-check-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #F8F9FB;
  border-radius: 10px;
  border: 1px solid #E5E7EB;
}

.form-check-toggle .form-check-input {
  width: 18px;
  height: 18px;
  accent-color: #9A77BC;
  cursor: pointer;
  flex-shrink: 0;
}

.form-check-toggle .form-check-label {
  font-weight: 600;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  margin: 0;
}

/* Footer Buttons */
.btn-cancel {
  padding: 10px 22px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  border: 1.5px solid #E5E7EB;
  color: #6B7280;
  background: #fff;
  transition: all 0.2s ease;
}

.btn-cancel:hover {
  background: #F3F4F6;
  border-color: #D1D5DB;
  color: #374151;
}

.btn-save {
  padding: 10px 28px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  background: #9A77BC;
  border: none;
  color: #fff;
  box-shadow: 0 2px 8px rgba(154, 119, 188, 0.3);
  transition: all 0.2s ease;
}

.btn-save:hover {
  background: #8A69AC;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(154, 119, 188, 0.4);
  color: #fff;
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Scrollbar */
.branch-modal .modal-body::-webkit-scrollbar {
  width: 6px;
}

.branch-modal .modal-body::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 3px;
}

.branch-modal .modal-body::-webkit-scrollbar-thumb {
  background: #D1D5DB;
  border-radius: 3px;
}

.branch-modal .modal-body::-webkit-scrollbar-thumb:hover {
  background: #B0B7C3;
}

@media (max-width: 768px) {
  .branch-modal .modal-dialog {
    max-width: 95%;
    margin: 10px auto;
  }
  
  .branch-modal .modal-body {
    padding: 16px;
  }
  
  .section-body {
    padding: 14px;
  }
}
</style>
