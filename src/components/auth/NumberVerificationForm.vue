<script setup>
import { reactive, watch, ref } from 'vue'
import { useAuthStore } from "../../stores/authStore";
import { storeToRefs } from 'pinia';
import IntlTelInput from "intl-tel-input/vue";
import "intl-tel-input/styles";


const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const phoneNumber = ref(null)
const phoneNumberRef = ref(null);
const isFocused = ref(false);
const showTooltip = ref(false);
const phoneError = ref("");
const errorCode = ref("");
const passwordValue = ref('')
defineProps({
    loading: Boolean,
    timerSeconds: Number
})
const form = reactive({
    mobileNumber: ""
})
const emit = defineEmits(['numberVerification'])
const changeErrorCode = (code) => {
    errorCode.value = code;
};
const geoIpLookup = (success, failure) => {
    fetch("https://ipapi.co/json")
        .then(res => res.json())
        .then(data => success(data.country_code))
        .catch(() => failure());
};
const normalizeToE164 = () => {
    const refValue = phoneNumberRef.value
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
const handleNumberVerification = () => {
    if (user.value && user.value.mobile_number) {
        form.mobileNumber = user.value.mobile_number;
    }

    const e164Number = normalizeToE164()
    if (!e164Number) {
        phoneError.value = 'Please enter a valid mobile number'
        return
    }

    phoneError.value = ""
    form.mobileNumber = e164Number
    emit('numberVerification', form)
}
function formatTime(seconds) {
    const min = Math.floor(seconds / 60)
    const sec = seconds % 60
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}
</script>
<template>
    <form @submit.prevent="handleNumberVerification">
        <div class="row">
            <div class="col-lg-12">
                <div class="form-group" v-if="!user || !user.mobile_number">
                    <label class="text-secondary">Mobile Number <small class="text-muted">(ex: 11xxxxxxx)</small></label>

                    <!-- IMPORTANT: keep outside Field because it's custom -->
                    <IntlTelInput v-model="phoneNumber" ref="phoneNumberRef" :inputProps="{
                        class: 'form-control',
                        onFocus: () => isFocused = true, onBlur: () => isFocused = false
                    }" initial-country="auto" :geo-ip-lookup="geoIpLookup"
                        :load-utils="() => import('intl-tel-input/utils')" @changeErrorCode="changeErrorCode" />

                    <div v-if="phoneError" class="text-danger mt-1">
                        {{ phoneError }}
                    </div>
                    <div v-if="isFocused" class="custom-tooltip"> Please provide a valid WhatsApp number. An OTP will be
                        sent to this number for verification. </div>
                </div>

            </div>
        </div>
        <button type="submit" class="btn btn-primary btn-block mt-2" :disabled="loading">
            <span v-if="!loading">{{ $t('verify_number') }}</span>
            <span v-else class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        </button>
        <div v-if="loading" class="text-center mt-3">
            <span class="fw-semibold">{{ $t('waiting_for_whatsapp_response') }}</span>
            <div class="text-muted small mt-2">{{ $t('verification_in_progress') }} {{ formatTime(timerSeconds) }}</div>
        </div>
    </form>
</template>