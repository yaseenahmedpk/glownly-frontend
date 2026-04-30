<script setup>
import ForgetPasswordForm from "../components/auth/ForgetPasswordForm.vue";
import { forgotPassword } from '../services/authService';
import { showErrorAlert } from "../helpers/swal";
import { handleApiError } from "../helpers/handleApiError";
import LanguageChanger from '../components/LanguageChanger.vue'
import { ref } from 'vue'
import backgroundImage from '../assets/images/login-bg.png'
import swal from 'sweetalert2'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const loading = ref(false)
const handlePasswordForget = async (form) => {
    try {
        loading.value = true
        const response = await forgotPassword(form);
        swal.fire({
            icon: 'success',
            title: response.data.message
        })
        // Optionally, show a success message or redirect the user
    } catch (error) {
        showErrorAlert(handleApiError(error, t));
    } finally {
        loading.value = false
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
                        <h3 class="mt-3">{{ $t('forget_password') }}</h3>
                        <p>{{ $t('number_verification_message') }}</p>
                    </div>
                    <ForgetPasswordForm @passwordForget="handlePasswordForget" :loading="loading" />
                </div>
            </div>
            <div class="col-md-6 login-bg right-fixed" :style="{ backgroundImage: `url(${backgroundImage})` }"></div>
        </div>
    </div>
</template>