<template>
    <EditProfile :profileData="profileData" :loading="loading" @updateProfile="handleUpdateProfile"
        @changePassword="handleChangePassword" @updateNotifications="handleUpdateNotifications"
        @updateContact="handleUpdateContact" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { getProfile, updateProfile, changePassword } from '../../services/authService'
import { handleApiError } from '../../helpers/handleApiError'
import { showErrorAlert } from '../../helpers/swal'
import DashboardLayout from '../../layouts/DashboardLayout.vue'
import EditProfile from '../../components/dashboard/EditProfile.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()
const profileData = ref({})
const loading = ref(false)

onMounted(async () => {
    try {
        const response = await getProfile()
        profileData.value = response.data
    } catch (err) {
        showErrorAlert(handleApiError(err,t))
    }
})

const handleUpdateProfile = async (data) => {
    loading.value = true
    try {
        await updateProfile(data)
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