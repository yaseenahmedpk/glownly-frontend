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
    loading: Boolean
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
const handleNumberVerification = () => {
    if (user.value && user.value.mobile_number) {
        form.mobileNumber = user.value.mobile_number;
    }

    phoneError.value = "";
    emit('numberVerification', form)
}
</script>
<template>
    <form @submit.prevent="handleNumberVerification">
        <div class="row">
            <div class="col-lg-12">
                <div class="form-group" v-if="!user || !user.mobile_number">
                    <label class="text-secondary">Mobile Number</label>

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
            <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            <span>
                {{ loading ? $t('verifying') : $t('verify_number') }}
            </span>

        </button>
    </form>
</template>