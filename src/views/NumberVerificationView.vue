<script setup>
import NumberVerificationForm from '../components/auth/NumberVerificationForm.vue'
import LanguageChanger from '../components/LanguageChanger.vue'
import { numberVerification } from '../services/authService'
import { handleApiError } from "../helpers/handleApiError";
import { showErrorAlert } from "../helpers/swal";
import backgroundImage from '../assets/images/login-bg.png'
import { ref } from 'vue'
import { getEcho } from '../services/echo';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';

const loading = ref(false)
const router = useRouter();
const store = useAuthStore();
const { user } = storeToRefs(store);
let channel = null;

onMounted(() => {
    if (!user.value || !user.value.mobile_number) {
        router.push('/login');
    } else {
        const echo = getEcho();
        if (!echo) return;
        const userId = user.value.id;
        channel = echo.private(`user.${userId}`);
        channel.stopListening('.user.verified');
        channel.listen('.user.verified', (e) => {
            loading.value = false;
            // update store
            store.user.is_verified = true;
            cleanup();
            // redirect
            router.push('/dashboard');
        });
    }

});
const handleNumberVerification = async (form) => {
    try {
        loading.value = true
        const response = await numberVerification(form)
        if (response.data.whatsAppTokenUrl) {
            window.open(response.data.whatsAppTokenUrl, '_blank');
        } else {
            showErrorAlert(response.data.message)
        }
    } catch (error) {
        showErrorAlert(handleApiError(error))
    } finally {
        loading.value = false
    }
}
function cleanup() {
    if (channel) {
        channel.stopListening('.user.verified');
        channel = null;
    }
}
</script>
<template>
    <div class="login-wrapper">

        <div class="row g-0 min-vh-100 ">

            <!-- LEFT SIDE -->
            <div class="col-md-6 d-flex align-items-center justify-content-center bg-white">
                <div class="lang-switcher">
                    <LanguageChanger />
                </div>
                <div class="login-box">

                    <div class="text-center mb-4">
                        <h3 class="mt-3">{{ $t('phone_number_verification') }}</h3>
                        <p>{{ $t('forget_password_message') }}</p>
                    </div>
                    <NumberVerificationForm @numberVerification="handleNumberVerification" :loading="loading" />
                </div>
            </div>
            <div class="col-md-6 login-bg right-fixed" :style="{ backgroundImage: `url(${backgroundImage})` }"></div>
        </div>
    </div>
</template>