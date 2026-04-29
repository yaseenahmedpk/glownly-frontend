<script setup>
import { reactive, ref, nextTick, onBeforeUnmount, computed } from 'vue'
import IntlTelInput from "intl-tel-input/vue";
import "intl-tel-input/styles";
import { Form, Field, ErrorMessage, useForm } from 'vee-validate'
import * as yup from 'yup'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'


const { t } = useI18n()
const phoneNumber = ref(null)
const phoneNumberRef = ref(null);
const isFocused = ref(false);
const showTooltip = ref(false);
const phoneError = ref("");
const errorCode = ref("");
const passwordValue = ref('')

defineProps({
    registrationMetaData: Object,
    loading: Boolean
})
const emit = defineEmits(['signup'])

const changeErrorCode = (code) => {
    errorCode.value = code;
};
const geoIpLookup = (success, failure) => {
    fetch("https://ipapi.co/json")
        .then(res => res.json())
        .then(data => success(data.country_code))
        .catch(() => failure());
};
const schema = yup.object({
    email: yup
        .string()
        .email('Invalid email')
        .required('Email is required'),

    password: yup
        .string()
        .min(8, 'Minimum 8 characters')
        .required('Password is required'),
    password_confirmation: yup
        .string()
        .oneOf([yup.ref('password'), null], 'Passwords must match')
        .required('Confirm Password is required'),
    firstName: yup
        .string()
        .required('First Name is required'),
    lastName: yup
        .string()
        .required('Last Name is required'),
    country: yup
        .string()
        .required('Country is required'),
    timezone: yup
        .string()
        .required('Timezone is required'),
    language: yup
        .string()
        .required('Language is required'),
    agreeToTerms: yup
        .bool()
        .oneOf([true], 'You must agree to the terms and conditions')
})

const onSubmit = (values) => {
    if (errorCode.value == null || errorCode.value === 0) {
        values.mobileNumber = phoneNumber.value
        // values.country = phoneNumberRef.value.instance.getSelectedCountryData().iso2
    } else {
        phoneError.value = t('please_provide_valid_whatsapp_number')
        return;
    }
    phoneError.value = "";
    emit('signup', values)
}
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

</script>

<template>
    <Form :validation-schema="schema" @submit="onSubmit" v-slot="{ values }">

        <div class="row">

            <!-- First Name -->
            <div class="col-6">
                <div class="form-group">
                    <label class="text-secondary">{{ $t('first_name') }}</label>
                    <Field name="firstName" class="form-control" :placeholder="$t('enter_first_name')" />
                    <ErrorMessage name="firstName" class="text-danger" />
                </div>
            </div>

            <!-- Last Name -->
            <div class="col-6">
                <div class="form-group">
                    <label class="text-secondary">{{ $t('last_name') }}</label>
                    <Field name="lastName" class="form-control" :placeholder="$t('enter_last_name')" />
                    <ErrorMessage name="lastName" class="text-danger" />
                </div>
            </div>

            <!-- Email -->
            <div class="col-12">
                <div class="form-group">
                    <label class="text-secondary">{{ $t('email') }}</label>
                    <Field name="email" type="email" class="form-control" :placeholder="$t('enter_email')" />
                    <ErrorMessage name="email" class="text-danger" />
                </div>
            </div>

            <!-- Password -->
            <div class="col-12 mt-2">
                <div class="form-group">
                    <label class="text-secondary">{{ $t('password') }}</label>
                    <Field name="password" v-slot="{ field }">
                        <input type="password" class="form-control" :placeholder="$t('enter_password')" v-bind="field"
                            @input="(e) => passwordValue = e.target.value" />
                    </Field>
                    <ErrorMessage name="password" class="text-danger" />
                    <div v-if="passwordValue" class="mt-2">
                        <div class="progress" style="height: 5px;">
                            <div class="progress-bar" :class="`bg-${passwordStrength.color}`" role="progressbar"
                                :style="{ width: (passwordStrength.score * 20) + '%' }"></div>
                        </div>

                        <small :class="`text-${passwordStrength.color}`">
                            {{ passwordStrength.label }} password
                        </small>
                    </div>
                </div>

            </div>

            <!-- Confirm Password -->
            <div class="col-12 mt-2">
                <div class="form-group">
                    <label class="text-secondary">{{ $t('confirm_password') }}</label>
                    <Field name="password_confirmation" type="password" class="form-control"
                        :placeholder="$t('confirm_password')" />
                    <ErrorMessage name="password_confirmation" class="text-danger" />
                </div>
            </div>

            <!-- Phone (kept your custom component but FIXED properly) -->
            <div class="col-12 mt-2">
                <div class="form-group">
                    <label class="text-secondary">{{ $t('mobile_number') }}</label>

                    <!-- IMPORTANT: keep outside Field because it's custom -->
                    <Field name="mobileNumber" v-slot="{ field, setValue }">
                        <IntlTelInput v-model="phoneNumber" ref="phoneNumberRef" :inputProps="{
                            class: 'form-control',
                            onFocus: () => isFocused = true, onBlur: () => isFocused = false
                        }" initial-country="auto" :geo-ip-lookup="geoIpLookup"
                            :load-utils="() => import('intl-tel-input/utils')" @changeErrorCode="changeErrorCode"
                            @input="setValue" />
                    </Field>
                    <div v-if="isFocused" class="custom-tooltip">
                        {{ $t('please_provide_valid_whatsapp_number') }}
                    </div>
                    <div v-if="phoneError" class="text-danger mt-1">
                        {{ phoneError }}
                    </div>
                </div>
            </div>

            <!-- Country -->
            <div class="col-12 mt-2">
                <div class="form-group">
                    <label class="text-secondary">{{ $t('country') }}</label>
                    <Field name="country" as="select" class="form-control">
                        <option value="">{{ $t('select_country') }}</option>
                        <option v-for="c in registrationMetaData?.countries || []" :key="c.id" :value="c.id">
                            {{ c.name }}
                        </option>
                    </Field>
                    <ErrorMessage name="country" class="text-danger" />
                </div>
            </div>

            <!-- Timezone -->
            <div class="col-12 mt-2">
                <div class="form-group">
                    <label class="text-secondary">{{ $t('timezone') }}</label>
                    <Field as="select" name="timezone" class="form-control">
                        <option value="">{{ $t('select_timezone') }}</option>
                        <option v-for="t in registrationMetaData?.timezones || []" :key="t.id" :value="t.id">
                            {{ t.label }}
                        </option>
                    </Field>
                    <ErrorMessage name="timezone" class="text-danger" />
                </div>
            </div>

            <!-- Language -->
            <div class="col-12 mt-2">
                <div class="form-group">
                    <label class="text-secondary">{{ $t('language') }}</label>
                    <Field name="language" as="select" class="form-control">
                        <option value="">{{ $t('select_language') }}</option>
                        <option v-for="l in registrationMetaData?.languages || []" :key="l.id" :value="l.id">
                            {{ l.name }}
                        </option>
                    </Field>
                    <ErrorMessage name="language" class="text-danger" />
                </div>
            </div>

            <!-- Terms -->
            <div class="col-12 mt-3">
                <div class="form-check">
                    <Field type="checkbox" name="agreeToTerms" class="form-check-input" />
                    <label class="form-check-label">{{ $t('i_agree_to_the_terms_and_conditions') }}</label>
                </div>
                <ErrorMessage name="agreeToTerms" class="text-danger" />
            </div>

            <!-- Marketing -->
            <div class="col-12 mt-3">
                <div class="form-check">
                    <Field type="checkbox" name="agreeToMarketing" class="form-check-input" />
                    <label class="form-check-label">{{ $t('marketing_communications') }}</label>
                </div>
            </div>

            <!-- Submit -->
            <div class="col-12 mt-3">
                <button type="submit" class="btn btn-primary w-100 d-flex justify-content-center align-items-center"
                    :disabled="loading">
                    <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"
                        aria-hidden="true"></span>

                    <span>
                        {{ loading ? $t('registering') : $t('register') }}
                    </span>
                </button>

            </div>
            <div class="col-12 mt-3">
                <div class="col-lg-12 mt-3">
                    <p class="mb-0 text-center">{{ $t('already_have_an_account') }} <RouterLink :to="`/login`">{{ $t('sign_in') }}</RouterLink>
                    </p>
                </div>
            </div>

        </div>

    </Form>

</template>
