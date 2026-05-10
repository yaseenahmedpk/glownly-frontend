<script setup>
import { userEmailVerification } from '../services/authService';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { handleApiError } from '../helpers/handleApiError';
import { showErrorAlert } from '../helpers/swal';
import { useI18n } from 'vue-i18n';
import backgroundImage from '../assets/images/login-bg.png'
import LanguageChanger from '../components/LanguageChanger.vue'
import { RouterLink } from 'vue-router';

const route = useRoute();
const { t } = useI18n();
const verificationResponse = ref("");
onMounted(async () => {
    const verifyEmailUrl = route.query.verify_url;
    try {
        const response = await userEmailVerification(verifyEmailUrl);
        verificationResponse.value = t(response.data.message)
    } catch (error) {
        showErrorAlert(handleApiError(error, t))
    }
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
                        <h3 class="mt-3">{{ verificationResponse }}</h3>
                    </div>
                    <RouterLink to="/dashboard" class="btn btn-primary btn-block mt-2" v-if="verificationResponse">
                        {{ $t('goto_dashboard') }}
                    </RouterLink>

                </div>
            </div>
            <div class="col-md-6 login-bg right-fixed" :style="{ backgroundImage: `url(${backgroundImage})` }"></div>
        </div>
    </div>
</template>