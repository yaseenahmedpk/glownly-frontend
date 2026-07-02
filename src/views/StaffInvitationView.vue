<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import IntlTelInput from "intl-tel-input/vue";
import "intl-tel-input/styles";
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
const mobileNumber = ref('')
const mobileNumberRef = ref(null)
const phoneError = ref('')
const errorCode = ref(null)
const password = ref('')
const passwordConfirmation = ref('')
const setPasswordLoading = ref(false)
const showPassword = ref(false)
const showPasswordConfirmation = ref(false)
const passwordValue = ref('')

const passwordStrength = computed(() => {
    const val = passwordValue.value
    if (!val) return { label: '', score: 0 }
    let score = 0
    if (val.length >= 8) score++
    if (/[A-Z]/.test(val)) score++
    if (/[a-z]/.test(val)) score++
    if (/[0-9]/.test(val)) score++
    if (/[^A-Za-z0-9]/.test(val)) score++
    if (score <= 2) return { label: 'Weak', color: 'danger', score }
    if (score === 3 || score === 4) return { label: 'Medium', color: 'warning', score }
    return { label: 'Strong', color: 'success', score }
})

const geoIpLookup = (success, failure) => {
  fetch("https://ipapi.co/json")
    .then(res => res.json())
    .then(data => success(data.country_code))
    .catch(() => failure())
}

const changeErrorCode = (code) => {
  errorCode.value = code
}

onMounted(async () => {
  token.value = route.params.token
  if (token.value) {
    await verifyInvitation()
  }
})

const verifyInvitation = async () => {
  try {
    loading.value = true
    const response = await verifyStaffInvitation(token.value)
    invitationVerified.value = true
    mobileNumber.value = response.data?.mobile_number || ''
  } catch (error) {
    showErrorAlert(handleApiError(error, t))
  } finally {
    loading.value = false
  }
}

const handleSetPassword = async () => {
  if (errorCode.value == null || errorCode.value === 0) {
    phoneError.value = ''
  } else {
    phoneError.value = t('please_provide_valid_whatsapp_number')
    return
  }

  if (password.value !== passwordConfirmation.value) {
    showErrorAlert([t('passwords_do_not_match')])
    return
  }
  try {
    setPasswordLoading.value = true
    await setStaffPassword({
      token: token.value,
      mobile_number: mobileNumber.value,
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
              <label class="text-secondary">{{ $t('mobile_number') }}</label>
              <IntlTelInput
                v-model="mobileNumber"
                ref="mobileNumberRef"
                :inputProps="{
                  class: 'form-control',
                  placeholder: $t('enter_mobile_number')
                }"
                initial-country="auto"
                :geo-ip-lookup="geoIpLookup"
                :load-utils="() => import('intl-tel-input/utils')"
                @changeErrorCode="changeErrorCode"
              />
              <div v-if="phoneError" class="text-danger mt-1">
                {{ phoneError }}
              </div>
            </div>
            <div class="form-group mb-3">
              <label class="text-secondary">{{ $t('password') }}</label>
              <div class="position-relative">
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  class="form-control"
                  :placeholder="$t('enter_password')"
                  required
                  @input="(e) => passwordValue = e.target.value"
                >
                <button type="button" class="btn btn-link position-absolute" style="right: 10px; top: 50%; transform: translateY(-50%); z-index: 10; padding: 0;" @click="showPassword = !showPassword">
                  <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
              <div v-if="passwordValue" class="mt-2">
                <div class="progress" style="height: 5px;">
                  <div class="progress-bar" :class="`bg-${passwordStrength.color}`" role="progressbar" :style="{ width: (passwordStrength.score * 20) + '%' }"></div>
                </div>
                <small :class="`text-${passwordStrength.color}`">
                  {{ passwordStrength.label }} password
                </small>
              </div>
            </div>
            <div class="form-group mb-4">
              <label class="text-secondary">{{ $t('confirm_password') }}</label>
              <div class="position-relative">
                <input
                  v-model="passwordConfirmation"
                  :type="showPasswordConfirmation ? 'text' : 'password'"
                  class="form-control"
                  :placeholder="$t('enter_confirm_password')"
                  required
                >
                <button type="button" class="btn btn-link position-absolute" style="right: 10px; top: 50%; transform: translateY(-50%); z-index: 10; padding: 0;" @click="showPasswordConfirmation = !showPasswordConfirmation">
                  <i :class="showPasswordConfirmation ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
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