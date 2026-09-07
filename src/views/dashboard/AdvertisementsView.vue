<script setup>
import { ref, onMounted, computed, nextTick } from "vue";
import Advertisements from "../../components/dashboard/Advertisements.vue";
import {
    getAdvertisements,
    storeAdvertisement,
    updateAdvertisement,
    deleteAdvertisement,
} from "../../services/advertisementService";
import { handleApiError } from '../../helpers/handleApiError'
import { showErrorAlert } from '../../helpers/swal'
import Swal from 'sweetalert2'
import { useI18n } from 'vue-i18n'
import { Modal } from "bootstrap"
import { hasPermission } from "../../helpers/authHelper";
import { useAuthStore } from '../../stores/authStore'
import { useToast } from '../../helpers/useToast'

const { t } = useI18n();
const loading = ref(false);
const advertisements = ref([]);
const modalObject = ref(null);
const modalTitle = ref(null);
const editingAdvertisementId = ref(null);
const authStore = useAuthStore();
const { toast } = useToast();
const advertisementFetchPromise = ref(null);
const selectedMediaFile = ref(null);
const mediaPreview = ref(null);
const mediaFileInput = ref(null);

const formData = ref({
    title: '',
    type: 'image',
    source_type: 'internal',
    advertiser_name: '',
    click_url: '',
    deep_link: '',
    thumbnail_url: '',
    media_url: null,
    starts_at: '',
    ends_at: '',
    priority: 0,
    display_duration_seconds: 5,
    skip_allowed: true,
    skip_after_seconds: 5,
    click_limit: 1000,
    impression_limit: 10000,
    is_active: true,
    placement: 'home_banner',
});

const placementOptions = [
    { value: 'home_banner', label: 'Home Banner' },
    { value: 'splash', label: 'Splash' },
    { value: 'sidebar', label: 'Sidebar' },
    { value: 'interstitial', label: 'Interstitial' },
];

const fetchAdvertisements = async () => {
    advertisementFetchPromise.value = (async () => {
        try {
            loading.value = true;
            const response = await getAdvertisements();
            const raw = response.data;
            const data = Array.isArray(raw)
                ? raw
                : (raw.advertisements || raw.data || []);
            advertisements.value = Array.isArray(data) ? data : [];
        } catch (error) {
            showErrorAlert(handleApiError(error, t));
        } finally {
            loading.value = false;
            advertisementFetchPromise.value = null;
        }
    })();
    await advertisementFetchPromise.value;
};

onMounted(() => {
    modalTitle.value = t("add");
    fetchAdvertisements();
});

const openMediaFileChooser = () => {
    mediaFileInput.value?.click();
};

const onMediaChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
        if (!allowedTypes.includes(file.type)) {
            showErrorAlert(t('media_type_not_allowed') || 'Media type not allowed');
            mediaFileInput.value.value = '';
            return;
        }
        const maxFileSize = 10 * 1024 * 1024;
        if (file.size > maxFileSize) {
            showErrorAlert(t('file_size_exceeded') || 'File size exceeded');
            mediaFileInput.value.value = '';
            return;
        }
        selectedMediaFile.value = file;
        mediaPreview.value = URL.createObjectURL(file);
    }
};

const openModal = async () => {
    const modalEl = document.getElementById("advertisementModal")
    modalObject.value = new Modal(modalEl, { backdrop: 'static', keyboard: false })
    editingAdvertisementId.value = null;
    resetForm();
    modalTitle.value = t("add");
    await nextTick();
    modalObject.value.show()
}

const resetForm = () => {
    formData.value = {
        title: '',
        type: 'image',
        source_type: 'internal',
        advertiser_name: '',
        click_url: '',
        deep_link: '',
        thumbnail_url: '',
        media_url: null,
        starts_at: '',
        ends_at: '',
        priority: 0,
        display_duration_seconds: 5,
        skip_allowed: true,
        skip_after_seconds: 5,
        click_limit: 1000,
        impression_limit: 10000,
        is_active: true,
        placement: 'home_banner',
    };
    selectedMediaFile.value = null;
    mediaPreview.value = null;
    if (mediaFileInput.value) {
        mediaFileInput.value.value = '';
    }
}

const closeModal = () => {
    if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur()
    }
    modalObject.value.hide()
}

const saveAdvertisement = async () => {
    try {
        loading.value = true
        const payload = new FormData();
        payload.append("title", formData.value.title);
        payload.append("type", formData.value.type);
        payload.append("source_type", formData.value.source_type);
        payload.append("advertiser_name", formData.value.advertiser_name || '');
        payload.append("click_url", formData.value.click_url || '');
        payload.append("deep_link", formData.value.deep_link || '');
        payload.append("thumbnail_url", formData.value.thumbnail_url || '');
        payload.append("starts_at", formData.value.starts_at || '');
        payload.append("ends_at", formData.value.ends_at || '');
        payload.append("priority", formData.value.priority || 0);
        payload.append("display_duration_seconds", formData.value.display_duration_seconds || 5);
        payload.append("skip_allowed", formData.value.skip_allowed ? 1 : 0);
        payload.append("skip_after_seconds", formData.value.skip_after_seconds || 0);
        payload.append("click_limit", formData.value.click_limit || 1000);
        payload.append("impression_limit", formData.value.impression_limit || 10000);
        payload.append("is_active", formData.value.is_active ? 1 : 0);
        payload.append("placements[]", formData.value.placement);
        if (selectedMediaFile.value) {
            payload.append("media_url", selectedMediaFile.value);
        }

        if (editingAdvertisementId.value) {
            await updateAdvertisement(editingAdvertisementId.value, payload);
        } else {
            await storeAdvertisement(payload);
        }
        modalObject.value.hide()
        toast(t('advertisement_saved_successfully'))
        fetchAdvertisements();
    } catch (error) {
        showErrorAlert(handleApiError(error, t));
    } finally {
        loading.value = false
    }
}

const handleAdvertisementData = async (data) => {
    if (advertisementFetchPromise.value) {
        await advertisementFetchPromise.value;
    }

    const modalEl = document.getElementById("advertisementModal");
    modalObject.value = new Modal(modalEl, { backdrop: 'static', keyboard: false });

    const placements = Array.isArray(data.placements) ? data.placements.filter(Boolean) : [];

    formData.value = {
        title: data.title || '',
        type: data.type || 'image',
        source_type: data.source_type || 'internal',
        advertiser_name: data.advertiser_name || '',
        click_url: data.click_url || '',
        deep_link: data.deep_link || '',
        thumbnail_url: data.thumbnail_url || '',
        media_url: data.media_url || '',
        starts_at: data.starts_at ? data.starts_at.slice(0, 16) : '',
        ends_at: data.ends_at ? data.ends_at.slice(0, 16) : '',
        priority: data.priority ?? 0,
        display_duration_seconds: data.display_duration_seconds ?? 5,
        skip_allowed: !!data.skip_allowed,
        skip_after_seconds: data.skip_after_seconds ?? 0,
        click_limit: data.click_limit ?? 1000,
        impression_limit: data.impression_limit ?? 10000,
        is_active: !!data.is_active,
        placement: placements[0] || 'home_banner',
    };
    selectedMediaFile.value = null;
    mediaPreview.value = data.media_url || null;
    editingAdvertisementId.value = data.id;
    modalTitle.value = t("edit");
    await nextTick();
    modalObject.value.show();
};

const handleDeleteAdvertisement = async (id) => {
    const result = await Swal.fire({
        title: t('are_you_sure'),
        text: t('delete_advertisement_confirm') || 'Delete this advertisement?',
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
            const response = await deleteAdvertisement(id);
            toast(t(response.data.message || 'advertisement_deleted_successfully'))
            fetchAdvertisements();
        } catch (error) {
            showErrorAlert(handleApiError(error, t));
        } finally {
            loading.value = false;
        }
    }
};
</script>

<template>
    <div class="advertisements-view">
        <div class="row align-items-center mb-4">
            <div class="col-lg-6 col-md-6">
                <h3 class="page-title">{{ $t('advertisements') }}</h3>
            </div>
            <div class="col-lg-6 col-md-6 d-flex justify-content-end" v-if="hasPermission('can_add_advertisement')">
                <button class="btn btn-primary btn-add-advertisement" @click="openModal">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                        stroke="currentColor" class="size-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    {{ $t('add') }}
                </button>
            </div>
            <div class="col-lg-12 col-md-12 col-sm-12 mt-2">
                <Advertisements :advertisements="advertisements" :loading="loading" @advertisementData="handleAdvertisementData" @deleteAdvertisement="handleDeleteAdvertisement" @statusUpdated="fetchAdvertisements" />
            </div>
        </div>

        <!-- Advertisement Modal -->
        <div class="modal fade advertisement-modal" id="advertisementModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-xl modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <div class="modal-header-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.25 2.25m0 0h3.75m-3.75 0h-1.5m1.5 0h1.5m-1.5 0v6" />
                            </svg>
                        </div>
                        <h5 class="modal-title">{{ modalTitle }} {{ $t('advertisement') }}</h5>
                        <button type="button" class="btn btn-icon btn-close-modal" aria-label="Close" @click="closeModal">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div class="modal-body">
                        <form @submit.prevent="saveAdvertisement">
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
                                            <label class="form-label">{{ $t('advertiser_name') || 'Advertiser Name' }} <span class="required">*</span></label>
                                            <input type="text" class="form-control" v-model="formData.advertiser_name" :placeholder="$t('enter_advertiser_name') || 'Enter advertiser name'" />
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label">{{ $t('title') || 'Title' }} <span class="required">*</span></label>
                                            <input type="text" class="form-control" v-model="formData.title" :placeholder="$t('enter_title') || 'Enter advertisement title'" />
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label">{{ $t('type') || 'Type' }} <span class="required">*</span></label>
                                            <select class="form-select" v-model="formData.type">
                                                <option value="image">{{ $t('image') || 'Image' }}</option>
                                                <option value="video">{{ $t('video') || 'Video' }}</option>
                                                <option value="html">{{ $t('html') || 'HTML' }}</option>
                                            </select>
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label">{{ $t('source_type') || 'Source Type' }} <span class="required">*</span></label>
                                            <select class="form-select" v-model="formData.source_type">
                                                <option value="internal">{{ $t('internal') || 'Internal' }}</option>
                                                <option value="external">{{ $t('external') || 'External' }}</option>
                                            </select>
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label">{{ $t('placement') || 'Placement' }} <span class="required">*</span></label>
                                            <select class="form-select" v-model="formData.placement">
                                                <option v-for="opt in placementOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                                            </select>
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label">{{ $t('click_url') || 'Click URL' }}</label>
                                            <input type="url" class="form-control" v-model="formData.click_url" :placeholder="$t('enter_click_url') || 'https://example.com/promo'" />
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label">{{ $t('deep_link') || 'Deep Link' }}</label>
                                            <input type="url" class="form-control" v-model="formData.deep_link" :placeholder="$t('enter_deep_link') || 'https://example.com/deep-link'" />
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label">{{ $t('thumbnail_url') || 'Thumbnail URL' }}</label>
                                            <input type="url" class="form-control" v-model="formData.thumbnail_url" :placeholder="$t('enter_thumbnail_url') || 'https://example.com/thumb.jpg'" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Media Section -->
                            <div class="form-section">
                                <div class="section-header">
                                    <div class="section-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-2.036-6.036a2.25 2.25 0 0 0-3.182 0L2.25 15.75m14.25 0 2.038-2.038a2.25 2.25 0 0 1 3.182 0l2.038 2.038M15 15.75v-3.75m0 0-1.5 1.5m0 0 1.5 1.5M18 18h-6" />
                                        </svg>
                                    </div>
                                    <h6 class="section-title">{{ $t('media') || 'Media' }}</h6>
                                </div>
                                <div class="section-body">
                                    <div class="row g-3">
                                        <div class="col-md-6">
                                            <label class="form-label">{{ $t('media_url') || 'Media File' }}</label>
                                            <div class="d-flex align-items-center gap-3">
                                                <div class="position-relative">
                                                    <img v-if="mediaPreview" :src="mediaPreview" alt="Preview" class="avatar-preview" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;" />
                                                    <div v-else class="avatar-placeholder" style="width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; background-color: #e9ecef; border-radius: 8px;">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 32px; height: 32px;">
                                                            <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-2.036-6.036a2.25 2.25 0 0 0-3.182 0L2.25 15.75m14.25 0 2.038-2.038a2.25 2.25 0 0 1 3.182 0l2.038 2.038M15 15.75v-3.75m0 0-1.5 1.5m0 0 1.5 1.5M18 18h-6" />
                                                        </svg>
                                                    </div>
                                                    <div class="crm-p-image bg-primary" @click="openMediaFileChooser" style="position: absolute; bottom: -5px; right: -5px; cursor: pointer; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 50%;">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                        </svg>
                                                        <input ref="mediaFileInput" class="file-upload" type="file" accept="image/*,video/*" @change="onMediaChange" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Schedule Section -->
                            <div class="form-section">
                                <div class="section-header">
                                    <div class="section-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                        </svg>
                                    </div>
                                    <h6 class="section-title">{{ $t('schedule') || 'Schedule' }}</h6>
                                </div>
                                <div class="section-body">
                                    <div class="row g-3">
                                        <div class="col-md-6">
                                            <label class="form-label">{{ $t('starts_at') || 'Start Date/Time' }}</label>
                                            <input type="datetime-local" class="form-control" v-model="formData.starts_at" />
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label">{{ $t('ends_at') || 'End Date/Time' }}</label>
                                            <input type="datetime-local" class="form-control" v-model="formData.ends_at" />
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label">{{ $t('priority') || 'Priority' }} <span class="required">*</span></label>
                                            <input type="number" class="form-control" v-model="formData.priority" min="0" :placeholder="$t('enter_priority') || 'Enter priority'" />
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label">{{ $t('display_duration_seconds') || 'Display Duration (seconds)' }} <span class="required">*</span></label>
                                            <input type="number" class="form-control" v-model="formData.display_duration_seconds" min="1" :placeholder="$t('enter_display_duration') || 'Enter display duration'" />
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label">{{ $t('click_limit') || 'Click Limit' }}</label>
                                            <input type="number" class="form-control" v-model="formData.click_limit" min="0" :placeholder="$t('enter_click_limit') || 'Enter click limit'" />
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label">{{ $t('impression_limit') || 'Impression Limit' }}</label>
                                            <input type="number" class="form-control" v-model="formData.impression_limit" min="0" :placeholder="$t('enter_impression_limit') || 'Enter impression limit'" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Behavior Section -->
                            <div class="form-section">
                                <div class="section-header">
                                    <div class="section-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065Z" />
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                        </svg>
                                    </div>
                                    <h6 class="section-title">{{ $t('behavior') || 'Behavior' }}</h6>
                                </div>
                                <div class="section-body">
                                    <div class="row g-3">
                                        <div class="col-md-6">
                                            <label class="form-label">{{ $t('skip_after_seconds') || 'Skip After (seconds)' }}</label>
                                            <input type="number" class="form-control" v-model="formData.skip_after_seconds" min="0" :placeholder="$t('enter_skip_after') || 'Enter seconds after which skip is allowed'" />
                                        </div>
                                        <div class="col-md-6">
                                            <div class="form-check-toggle">
                                                <input type="checkbox" class="form-check-input" id="skipAllowed" v-model="formData.skip_allowed" />
                                                <label class="form-check-label" for="skipAllowed">{{ $t('skip_allowed') || 'Skip Allowed' }}</label>
                                            </div>
                                            <div class="form-check-toggle mt-3">
                                                <input type="checkbox" class="form-check-input" id="isActive" v-model="formData.is_active" />
                                                <label class="form-check-label" for="isActive">{{ $t('is_active') }}</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary btn-cancel" @click="closeModal">{{ $t('cancel') }}</button>
                        <button class="btn btn-primary btn-save" :disabled="loading" @click="saveAdvertisement">
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
.advertisements-view {
    position: relative;
}

.page-title {
    color: #1A1A2E;
    font-weight: 700;
    font-size: 26px;
    margin: 0;
}

.btn-add-advertisement {
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

.btn-add-advertisement:hover {
    background: #8A69AC;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(154, 119, 188, 0.4);
    color: #fff;
}

.advertisement-modal .modal-dialog {
    max-width: 960px;
}

.advertisement-modal .modal-content {
    border: none;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 4px 16px rgba(0, 0, 0, 0.08);
    overflow: hidden;
}

.advertisement-modal .modal-header {
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

.advertisement-modal .modal-title {
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

.advertisement-modal .modal-body {
    padding: 24px;
    max-height: 65vh;
    overflow-y: auto;
    background: #F9FAFB;
}

.advertisement-modal .modal-footer {
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
.advertisement-modal .modal-body::-webkit-scrollbar {
    width: 6px;
}

.advertisement-modal .modal-body::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 3px;
}

.advertisement-modal .modal-body::-webkit-scrollbar-thumb {
    background: #D1D5DB;
    border-radius: 3px;
}

.advertisement-modal .modal-body::-webkit-scrollbar-thumb:hover {
    background: #B0B7C3;
}

.avatar-preview {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 8px;
    border: 1px solid #E5E7EB;
}

.avatar-placeholder {
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #e9ecef;
    border-radius: 8px;
    border: 1px solid #E5E7EB;
}

.crm-p-image {
    position: absolute;
    bottom: -5px;
    right: -5px;
    cursor: pointer;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    color: #fff;
}

.file-upload {
    display: none;
}

@media (max-width: 768px) {
    .advertisement-modal .modal-dialog {
        max-width: 95%;
        margin: 10px auto;
    }

    .advertisement-modal .modal-body {
        padding: 16px;
    }

    .section-body {
        padding: 14px;
    }
}
</style>
