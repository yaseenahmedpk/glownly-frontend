<script setup>
import { ref, onMounted } from 'vue'
import BusinessDetailsForm from '../../components/onboarding/BusinessDetailsForm.vue'
import loginbg from '../../assets/images/login-bg.png'
import LanguageChanger from '../../components/LanguageChanger.vue'
import { getBusinessCategories, saveBusinessDetails } from '../../services/authService'
import { useAuthStore } from '../../stores/authStore'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { handleApiError } from "../../helpers/handleApiError";
import { showErrorAlert } from "../../helpers/swal";
import { useI18n } from 'vue-i18n'

const { t } = useI18n();
const authStore = useAuthStore()
const { user } = storeToRefs(authStore)
const router = useRouter()

// Redirect to signup if no user data
if (!user.value) {
    router.push('/signup')
}

const categories = ref([])
const loading = ref(false)
const saving = ref(false)

onMounted(async () => {
    try {
        loading.value = true
        const response = await getBusinessCategories()
        categories.value = response.data || []
    } catch (err) {
        const messages = handleApiError(err, t)
        if (messages?.length) {
            showErrorAlert(messages)
        }
    } finally {
        loading.value = false
    }
})

const handleCompanyDetails = async (payload) => {
    try {
        saving.value = true
        const data = { ...payload, user_id: user.value.id }
        await saveBusinessDetails(data)
        // Success - redirect to dashboard or next step
        router.push('/number-verification')
    } catch (err) {
        console.error('Error saving business details:', err)
        const messages = handleApiError(err, t)
        if (messages?.length) {
            showErrorAlert(messages)
        }
    } finally {
        saving.value = false
    }
}

</script>

<template>

    <div class="login-wrapper">

        <div class="row g-0 min-vh-100">
            <div class="col-md-6 d-flex align-items-center justify-content-center bg-white left-scroll">
                <div class="lang-switcher">
                    <LanguageChanger />
                </div>
                <div class="login-box">

                    <div class="text-center mb-4">
                        <h3 class="mt-3">{{ $t('your_business_details') }}</h3>
                        <p class="text-muted">{{ $t('business_message') }}</p>
                    </div>

                    <BusinessDetailsForm 
                        @businessSubmit="handleCompanyDetails" 
                        :categories="categories"
                        :loading="loading || saving"
                    />
                </div>
            </div>
            <div class="col-md-6 login-bg right-fixed" :style="{ backgroundImage: `url(${loginbg})` }"></div>

        </div>

    </div>
</template>