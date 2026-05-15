<script setup>
import LoginForm from '../components/auth/LoginForm.vue'
import LanguageChanger from '../components/LanguageChanger.vue'
import { login } from '../services/authService'
import { useAuthStore } from '../stores/authStore'
import '../assets/css/backend.css'
import '../assets/css/custom.css'
import logo from '../assets/images/glownly_logo.png'
import loginbg from '../assets/images/login-bg.png'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { handleApiError } from '../helpers/handleApiError'
import { showErrorAlert } from '../helpers/swal'
import router from "../router";
import { ref } from 'vue'

const { t } = useI18n()
const authStore = useAuthStore()
const loading = ref(false)
const handleLogin = async (form) => {
  try {
    loading.value = true
    const response = await login(form)
    authStore.setToken(response.data.data.token)
    authStore.setUser(response.data.data.user)
    authStore.setPermissions(response.data.data.allPermissions || [])
    const businesses = response.data.data.businesses || []
    authStore.setBusinesses(businesses)
    if (businesses.length > 1) {
      authStore.setCompany(null)
      router.push("/business-selection")
    } else {
      authStore.setCompany(businesses.length === 1 ? businesses[0] : null)
      router.push("/dashboard")
    }

  } catch (error) {
    showErrorAlert(handleApiError(error, t))
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
            <h3 class="mt-3">{{ $t('login') }}</h3>
            <p class="text-muted">{{ $t('login_to_your_account_to_continue') }}</p>
          </div>
          <div class="social-btn d-flex justify-content-around align-items-center mb-4">
            <button class="btn btn-outline-light">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="88.428 12.828 107.543 207.085">
                <path
                  d="M158.232 219.912v-94.461h31.707l4.747-36.813h-36.454V65.134c0-10.658 2.96-17.922 18.245-17.922l19.494-.009V14.278c-3.373-.447-14.944-1.449-28.406-1.449-28.106 0-47.348 17.155-47.348 48.661v27.149H88.428v36.813h31.788v94.461l38.016-.001z"
                  fill="#3c5a9a" />
              </svg>
            </button>
            <button class="btn btn-outline-light">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 262"
                preserveAspectRatio="xMidYMid">
                <path
                  d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                  fill="#4285F4" />
                <path
                  d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                  fill="#34A853" />
                <path
                  d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
                  fill="#FBBC05" />
                <path
                  d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                  fill="#EB4335" />
              </svg>
            </button>
            <button class="btn btn-outline-light">
              <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="black" class="bi bi-apple"
                viewBox="0 0 16 16">
                <path
                  d="M11.182.008C11.148-.03 9.923.023 8.857 1.18c-1.066 1.156-.902 2.482-.878 2.516s1.52.087 2.475-1.258.762-2.391.728-2.43m3.314 11.733c-.048-.096-2.325-1.234-2.113-3.422s1.675-2.789 1.698-2.854-.597-.79-1.254-1.157a3.7 3.7 0 0 0-1.563-.434c-.108-.003-.483-.095-1.254.116-.508.139-1.653.589-1.968.607-.316.018-1.256-.522-2.267-.665-.647-.125-1.333.131-1.824.328-.49.196-1.422.754-2.074 2.237-.652 1.482-.311 3.83-.067 4.56s.625 1.924 1.273 2.796c.576.984 1.34 1.667 1.659 1.899s1.219.386 1.843.067c.502-.308 1.408-.485 1.766-.472.357.013 1.061.154 1.782.539.571.197 1.111.115 1.652-.105.541-.221 1.324-1.059 2.238-2.758q.52-1.185.473-1.282" />
                <path
                  d="M11.182.008C11.148-.03 9.923.023 8.857 1.18c-1.066 1.156-.902 2.482-.878 2.516s1.52.087 2.475-1.258.762-2.391.728-2.43m3.314 11.733c-.048-.096-2.325-1.234-2.113-3.422s1.675-2.789 1.698-2.854-.597-.79-1.254-1.157a3.7 3.7 0 0 0-1.563-.434c-.108-.003-.483-.095-1.254.116-.508.139-1.653.589-1.968.607-.316.018-1.256-.522-2.267-.665-.647-.125-1.333.131-1.824.328-.49.196-1.422.754-2.074 2.237-.652 1.482-.311 3.83-.067 4.56s.625 1.924 1.273 2.796c.576.984 1.34 1.667 1.659 1.899s1.219.386 1.843.067c.502-.308 1.408-.485 1.766-.472.357.013 1.061.154 1.782.539.571.197 1.111.115 1.652-.105.541-.221 1.324-1.059 2.238-2.758q.52-1.185.473-1.282" />
              </svg>
            </button>
          </div>
          <div class="mb-5">
            <p class="line-around text-secondary mb-0"><span class="line-around-1">{{ $t('or_login_with_email')
                }}</span></p>
          </div>
          <LoginForm @login="handleLogin" :loading="loading" />
        </div>
      </div>
      <!-- RIGHT SIDE -->
      <div class="col-md-6 login-bg" :style="{ backgroundImage: `url(${loginbg})` }"></div>

    </div>

  </div>
</template>
