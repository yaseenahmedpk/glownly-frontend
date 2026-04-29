<script setup>
import ResetPasswordForm from "../components/auth/ResetPasswordForm.vue";
import { resetPassword } from '../services/authService';
import { showErrorAlert } from "../helpers/swal";
import { handleApiError } from "../helpers/handleApiError";
import LanguageChanger from '../components/LanguageChanger.vue'
import { onMounted, ref } from 'vue'
import backgroundImage from '../assets/images/login-bg.png'
import swal from 'sweetalert2'
import { useRoute } from 'vue-router'


const loading = ref(false)
const token = ref('')
const email = ref('')
const route = useRoute()
const formRef = ref(null)
onMounted(() => {
    token.value = route.query.token
    email.value = route.query.email
})
const handlePasswordReset = async (form) => {
    try {
        loading.value = true
        const response = await resetPassword(form);
        swal.fire({
            icon: 'success',
            title: response.data.message
        })
        
    } catch (error) {
        showErrorAlert(handleApiError(error))
    } finally {
        loading.value = false
        formRef.value?.resetForm()
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
                        <h3 class="mt-3">{{ $t('reset_password') }}</h3>
                        <p>{{ $t('change_password_message') }}</p>
                    </div>
                    <ResetPasswordForm @passwordReset="handlePasswordReset" :loading="loading" :token="token" :email="email" ref="formRef" />
                </div>
            </div>
            <div class="col-md-6 login-bg right-fixed" :style="{ backgroundImage: `url(${backgroundImage})` }"></div>
        </div>
    </div>
</template>