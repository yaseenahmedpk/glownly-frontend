<template>
    <div>
        <div v-if="loading && Object.keys(profileData).length === 0" class="d-flex justify-content-center align-items-center" style="min-height: 300px;">
            <div class="text-center">
                <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;"></div>
            </div>
        </div>

        <EditProfile v-else :profileData="profileData" :loading="loading" @updateProfile="handleUpdateProfile"
            @changePassword="handleChangePassword" @updateNotifications="handleUpdateNotifications"
            @updateContact="handleUpdateContact" />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { getProfile, updateProfile, changePassword } from '../../services/authService'
import { handleApiError } from '../../helpers/handleApiError'
import { showErrorAlert } from '../../helpers/swal'
import { useToast } from '../../helpers/useToast'
import DashboardLayout from '../../layouts/DashboardLayout.vue'
import EditProfile from '../../components/dashboard/EditProfile.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const { toast } = useToast()
const router = useRouter()
const profileData = ref({})
const loading = ref(false)

onMounted(async () => {
    loading.value = true
    try {
        const response = await getProfile()
        profileData.value = response.data
    } catch (err) {
        showErrorAlert(handleApiError(err,t))
    } finally {
        loading.value = false
    }
})

const buildFormData = (obj, formData = new FormData(), parentKey = '') => {
    Object.entries(obj).forEach(([key, value]) => {
        const formKey = parentKey ? `${parentKey}[${key}]` : key
        if (value instanceof File) {
            formData.append(formKey, value)
        } else if (value && typeof value === 'object' && !(value instanceof Date)) {
            buildFormData(value, formData, formKey)
        } else if (value !== undefined && value !== null) {
            formData.append(formKey, value)
        }
    })
    return formData
}

const handleUpdateProfile = async (data) => {
    loading.value = true
    try {
        let response
        if (data.profileFile) {
            const payload = { ...data }
            delete payload.profileFile
            payload.profile_pic = data.profileFile
            const formData = buildFormData(payload)
            response = await updateProfile(formData)
        } else {
            response = await updateProfile(data)
        }

        if (response?.data?.message) {
            toast(t(response.data.message))
        }
    } catch (err) {
        showErrorAlert(handleApiError(err,t))
    } finally {
        loading.value = false
    }
}

const handleChangePassword = async (data) => {
    loading.value = true
    try {
        await changePassword(data)
        Swal.fire({
            icon: 'success',
            title: 'Password changed successfully',
            timer: 1500,
            showConfirmButton: false
        })
    } catch (err) {
        showErrorAlert(handleApiError(err,t))
    } finally {
        loading.value = false
    }
}

const handleUpdateNotifications = async (data) => {
    // Assume part of profile
    await handleUpdateProfile(data)
}

const handleUpdateContact = async (data) => {
    // Assume part of profile
    await handleUpdateProfile(data)
}
</script>