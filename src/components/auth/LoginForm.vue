<script setup>
import { reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import IntlTelInput from "intl-tel-input/vue";
import "intl-tel-input/styles";

const form = reactive({
    mobileNumber: '',
    password: ''
})
const mobileNumberRef = ref(null)
const phoneError = ref('')
const errorCode = ref(null)

defineProps({
    loading: Boolean
})
const emit = defineEmits(['login'])

const geoIpLookup = (success, failure) => {
    fetch("https://ipapi.co/json")
        .then(res => res.json())
        .then(data => success(data.country_code))
        .catch(() => failure())
}

const changeErrorCode = (code) => {
    errorCode.value = code
}

const normalizeToE164 = () => {
    const refValue = mobileNumberRef.value
    const instance = refValue?.instance
    if (!instance) return ''

    const countryData = instance.getSelectedCountryData()
    const countryCode = countryData?.dialCode || ''
    if (!countryCode) return ''

    const inputEl = refValue?.input || instance?.telInputEl
    if (!inputEl) return ''

    let raw = inputEl.value || ''
    if (raw.startsWith('+')) return raw

    raw = raw.replace(/[^0-9]/g, '')
    if (!raw) return ''

    let national = raw
    if (national.startsWith('0')) {
        national = national.slice(1)
    }
    if (!national) return ''

    return `+${countryCode}${national}`
}

const handleLogin = () => {
    const e164Number = normalizeToE164()

    if (!e164Number) {
        phoneError.value = 'Please enter a valid mobile number'
        return
    }

    phoneError.value = ''
    const payload = { ...form, mobileNumber: e164Number }
    emit('login', payload)
}
</script>
<template>
    <form @submit.prevent="handleLogin">
        <div class="row">
                <div class="col-lg-12">
                    <div class="form-group">
                        <label class="text-secondary">{{ $t('mobile_number') }} <small class="text-muted">({{ $t('mobile_number_example') }})</small></label>
                        <IntlTelInput
                            v-model="form.mobileNumber"
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
                </div>
                <div class="col-lg-12 mt-2">
                    <div class="form-group">
                        <div class="d-flex justify-content-between align-items-center">
                            <label class="text-secondary">{{ $t('password') }}</label>
                            <RouterLink :to="`/forget-password`">{{ $t('forgot_password') }}</RouterLink>
                        </div>
                        <input class="form-control" type="password" id="password" v-model="form.password"
                            :placeholder="$t('enter_password')">
                    </div>
                </div>
            </div>

            <button type="submit" class="btn btn-primary w-100 d-flex justify-content-center align-items-center"
                :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>

                <span>
                    {{ loading ? $t('processing') : $t('sign_in') }}
                </span>
            </button>

            <div class="col-lg-12 mt-3">
                <p class="mb-0 text-center"> {{ $t('dont_have_an_account') }} <RouterLink :to="`/signup`">{{ $t('sign_up')
                        }}</RouterLink>
                </p>
            </div>
        </form>
    </template>