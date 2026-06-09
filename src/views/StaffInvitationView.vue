<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { verifyStaffInvitation, setStaffPassword } from '../services/authService'
import { showErrorAlert } from '../helpers/swal'
import { handleApiError } from '../helpers/handleApiError'
import backgroundImage from '../assets/images/login-bg.png'

const { t } = useI18n()
const route = useRoute()

const token = ref('')
const loading = ref(false)
const invitationVerified = ref(false)
const passwordSet = ref(false)
const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const setPasswordLoading = ref(false)

onMounted(async () => {
  token.value = route.query.token
  if (token.value) {
    await verifyInvitation()
  }
})

const verifyInvitation = async () => {
  try {
    loading.value = true
    const response = await verifyStaffInvitation(token.value)
    invitationVerified.value = true
    email.value = response.data?.email || ''
  } catch (error) {
    showErrorAlert(handleApiError(error, t))
  } finally {
    loading.value = false
  }
}

const handleSetPassword = async () => {
  if (password.value !== passwordConfirmation.value) {
    showErrorAlert([t('passwords_do_not_match')])
    return
  }
  try {
    setPasswordLoading.value = true
    await setStaffPassword({
      token: token.value,
      email: email.value,
      password: password.value,
      password_confirmation: passwordConfirmation.value
    })
    passwordSet.value = true
  } catch (error) {
    showErrorAlert(handleApiError(error, t))
  } finally {
    setPasswordLoading.value = false
  }
}
</script>

<template>
  <div class="login-wrapper">
    <div class="row g-0 min-vh-100">
      <div class="col-md-6 d-flex align-items-center justify-content-center bg-white">
        <div class="login-box w-100 px-4">
          <div class="text-center mb-4">
            <h3 class="mt-3">{{ $t('staff_invitation_title') }}</h3>
            <p v-if="loading" class="text-muted">{{ $t('verifying_invitation') }}</p>
            <p v-else-if="passwordSet" class="text-muted">{{ $t('download_apps_title') }}</p>
            <p v-else-if="invitationVerified" class="text-muted">{{ $t('set_new_password') }}</p>
            <p v-else class="text-muted">{{ $t('invitation_expired') }}</p>
          </div>

          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="sr-only">Loading...</span>
            </div>
          </div>

          <form v-else-if="invitationVerified && !passwordSet" @submit.prevent="handleSetPassword">
            <div class="form-group mb-3">
              <label class="text-secondary">{{ $t('email') }}</label>
              <input
                v-model="email"
                type="email"
                class="form-control"
                :placeholder="$t('enter_email')"
                required
              >
            </div>
            <div class="form-group mb-3">
              <label class="text-secondary">{{ $t('password') }}</label>
              <input
                v-model="password"
                type="password"
                class="form-control"
                :placeholder="$t('enter_password')"
                required
              >
            </div>
            <div class="form-group mb-4">
              <label class="text-secondary">{{ $t('confirm_password') }}</label>
              <input
                v-model="passwordConfirmation"
                type="password"
                class="form-control"
                :placeholder="$t('enter_confirm_password')"
                required
              >
            </div>
            <button
              type="submit"
              class="btn btn-primary w-100 d-flex justify-content-center align-items-center"
              :disabled="setPasswordLoading"
            >
              <span v-if="setPasswordLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              <span>{{ setPasswordLoading ? $t('setting_password') : $t('set_password') }}</span>
            </button>
          </form>

          <div v-else-if="passwordSet" class="text-center">
            <p class="mb-4">{{ $t('download_apps_message') }}</p>
            <div class="d-flex gap-2 justify-content-center">
              <a href="#" class="btn btn-outline-primary">
                <i class="fab fa-apple me-2"></i> App Store
              </a>
              <a href="#" class="btn btn-outline-primary">
                <i class="fab fa-google-play me-2"></i> Google Play
              </a>
            </div>
          </div>

          <div v-else class="text-center">
            <button class="btn btn-primary" @click="$router.push('/login')">
              {{ $t('goto_login') }}
            </button>
          </div>
        </div>
      </div>
      <div class="col-md-6 login-bg right-fixed" :style="{ backgroundImage: `url(${backgroundImage})` }"></div>
    </div>
  </div>
</template>

<style scoped>
.login-wrapper {
  min-height: 100vh;
}
.login-box {
  max-width: 400px;
  width: 100%;
}
</style>