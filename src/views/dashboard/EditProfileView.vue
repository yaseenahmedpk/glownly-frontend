<template>
    <div>
        <div v-if="loading && Object.keys(profileData).length === 0"
            class="d-flex justify-content-center align-items-center" style="min-height: 300px;">
            <div class="text-center">
                <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;"></div>
            </div>
        </div>

        <EditProfile v-else :profileData="profileData" :loading="loading" :verifyingEmail="verifyingEmail"
            :verifyingMobile="verifyingMobile" @updateProfile="handleUpdateProfile"
            @changePassword="handleChangePassword" @verifyMobile="handleVerifyMobile" @verifyEmail="handleVerifyEmail"
            @updateBusiness="handleUpdateBusiness" ref="passwordFormRef" />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { getProfile, updateProfile, changePassword, verifyEmail, requestMobileVerification, updateBusinessDetails } from '../../services/authService'
import { handleApiError } from '../../helpers/handleApiError'
import { showErrorAlert } from '../../helpers/swal'
import { useToast } from '../../helpers/useToast'
import EditProfile from '../../components/dashboard/EditProfile.vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from "../../stores/authStore";
import { getEcho } from '../../services/echo'

const authStore = useAuthStore()
const { t } = useI18n()
const { toast } = useToast()
const profileData = ref({})
const loading = ref(false)
const passwordFormRef = ref(null)
const verificationChannel = ref(null)
const verifyingEmail = ref(false)
const verifyingMobile = ref(false)

onMounted(async () => {
    loading.value = true
    try {
        const response = await getProfile()
        profileData.value = response.data
    } catch (err) {
        showErrorAlert(handleApiError(err, t))
    } finally {
        loading.value = false
    }
})

const handleUpdateProfile = async (data) => {
    loading.value = true
    try {
        let response
        if (data.profileFile instanceof File) {
            // Create FormData directly for file upload
            const formData = new FormData()
            formData.append('first_name', data.first_name)
            formData.append('last_name', data.last_name)
            formData.append('language_id', data.language_id)
            formData.append('timezone_id', data.timezone_id)
            formData.append('country_id', data.country_id)
            formData.append('gender', data.gender)
            formData.append('city', data.city)
            formData.append('state_id', data.state_id)
            formData.append('profile_pic', data.profileFile)

            response = await updateProfile(formData)
        } else {
            response = await updateProfile(data)
        }
        if (response?.data?.user) {
            authStore.setUser({
                ...authStore.user,
                ...response.data.user
            })
        }

        if (response?.data?.message) {
            toast(t(response.data.message))
        }
    } catch (err) {
        showErrorAlert(handleApiError(err, t))
    } finally {
        loading.value = false
    }
}

const handleUpdateBusiness = async (data) => {
    loading.value = true
    try {
        let response
        if (data.businessLogoFile instanceof File) {
            // Create FormData directly for file upload
            const formData = new FormData()
            formData.append('business_name', data.business_name)
            formData.append('website', data.website)
            formData.append('timezone_id', data.timezone_id)
            formData.append('country_id', data.country_id)
            formData.append('city', data.city)
            formData.append('state_id', data.state_id)
            formData.append('address', data.address)
            formData.append('categories', JSON.stringify(data.categories))
            formData.append('logo', data.businessLogoFile)

            response = await updateBusinessDetails(formData)
        } else {
            response = await updateBusinessDetails(data)
        }

        if (response?.data?.message) {
            toast(t(response.data.message))
        }
    } catch (err) {
        showErrorAlert(handleApiError(err, t))
    } finally {
        loading.value = false
    }
}

const handleChangePassword = async (data) => {
    loading.value = true
    try {
        const formatedDate = {
            current_password: data.currentPassword,
            new_password: data.newPassword,
            new_password_confirmation: data.confirmPassword
        }
        await changePassword(formatedDate)
        toast(t("password_changed_successfully"))
        await nextTick()
        passwordFormRef.value?.resetPasswordFields()
    } catch (err) {
        showErrorAlert(handleApiError(err, t))
    } finally {

        loading.value = false
    }
}

const handleVerifyEmail = async (email) => {
    verifyingEmail.value = true
    try {
        const response = await verifyEmail({ email })
        toast(t(response.data.message))
    } catch (error) {
        showErrorAlert(handleApiError(error, t))
    } finally {
        verifyingEmail.value = false
    }
}

const handleVerifyMobile = async (contactNumber) => {
    verifyingMobile.value = true
    try {
        const response = await requestMobileVerification({ mobileNumber: contactNumber })
        if (response.data?.whatsAppTokenUrl) {
            const result = await Swal.fire({
                title: t('phone_number_verification'),
                text: t('number_verification_message'),
                icon: 'info',
                showCancelButton: true,
                confirmButtonText: t('verify_number'),
                cancelButtonText: t('cancel')
            })
            if (result.isConfirmed) {
                window.open(response.data.whatsAppTokenUrl, '_blank')
                setupVerificationListener()
            }
        } else {
            showErrorAlert(handleApiError(error, t))
        }
    } catch (error) {
        showErrorAlert(handleApiError(error, t))
    } finally {
        verifyingMobile.value = false
    }
}

const setupVerificationListener = () => {
    if (!authStore.user || !authStore.user.id) return

    const echo = getEcho()
    if (!echo) return

    if (verificationChannel.value) {
        verificationChannel.value.stopListening('.user.verified')
    }

    verificationChannel.value = echo.private(`user.${authStore.user.id}`)
    verificationChannel.value.listen('.user.verified', (e) => {
        if (verificationChannel.value) {
            verificationChannel.value.stopListening('.user.verified')
            verificationChannel.value = null
        }
        // Trigger profile refresh to get updated verification status
        fetchProfile()
    })
}

const fetchProfile = async () => {
    try {
        const response = await getProfile()
        profileData.value = response.data
    } catch (err) {
        showErrorAlert(handleApiError(err, t))
    }
}
</script>