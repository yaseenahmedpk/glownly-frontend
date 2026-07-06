<script setup>
import NumberVerificationForm from '../components/auth/NumberVerificationForm.vue'
import LanguageChanger from '../components/LanguageChanger.vue'
import { numberVerification } from '../services/authService'
import { handleApiError } from "../helpers/handleApiError";
import { showErrorAlert, showSuccessAlert } from "../helpers/swal";
import backgroundImage from '../assets/images/login-bg.png'
import { ref, watch, onUnmounted } from 'vue'
import { getEcho } from '../services/echo';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n'


const { t } = useI18n();
const loading = ref(false)
const timerSeconds = ref(0)
const timerInterval = ref(null)
const router = useRouter();
const store = useAuthStore();
const { user } = storeToRefs(store);
let channel = null;

function formatTime(seconds) {
    const min = Math.floor(seconds / 60)
    const sec = seconds % 60
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

function startTimer() {
    timerSeconds.value = 180
    if (timerInterval.value) clearInterval(timerInterval.value)
    timerInterval.value = setInterval(() => {
        if (timerSeconds.value > 0) {
            timerSeconds.value--
        }
    }, 1000)
}

function resetTimer() {
    if (timerInterval.value) {
        clearInterval(timerInterval.value)
        timerInterval.value = null
    }
    timerSeconds.value = 0
}

watch(loading, (val) => {
    if (val) startTimer()
    else resetTimer()
})

onMounted(() => {
    if (!user.value || !user.value.mobile_number) {
        router.push('/login');
    } else {
        const echo = getEcho();
        if (!echo) return;
        const userId = user.value.id;
        channel = echo.private(`user.${userId}`);
        channel.stopListening('.user.verified');
        channel.listen('.user.verified', async (e) => {
            loading.value = false;
            resetTimer();
            store.user.is_verified = true;
            cleanup();
            await showSuccessAlert(t('number_verified'), t('number_verified_login_message'))
            await store.logout();
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
            showErrorAlert(handleApiError(response.data.message, t))
            loading.value = false
        }
    } catch (error) {
        showErrorAlert(handleApiError(error, t))
        loading.value = false
    }
}
function cleanup() {
    if (channel) {
        channel.stopListening('.user.verified');
        channel = null;
    }
}

onUnmounted(() => {
    cleanup()
    resetTimer()
});
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
                    <NumberVerificationForm @numberVerification="handleNumberVerification" :loading="loading" :timer-seconds="timerSeconds" />
                </div>
            </div>
            <div class="col-md-6 login-bg right-fixed" :style="{ backgroundImage: `url(${backgroundImage})` }"></div>
        </div>
    </div>
</template>