<script setup>
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import backgroundImage from '../assets/images/login-bg.png'
import LanguageChanger from '../components/LanguageChanger.vue'
import { RouterLink } from 'vue-router';

const route = useRoute();
const { t } = useI18n();
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
                    <RouterLink to="/login" class="btn btn-primary btn-block mt-2">
                        {{ $t('goto_login') }}
                    </RouterLink>

                </div>
            </div>
            <div class="col-md-6 login-bg right-fixed" :style="{ backgroundImage: `url(${backgroundImage})` }"></div>
        </div>
    </div>
</template>