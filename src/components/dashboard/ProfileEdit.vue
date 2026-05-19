<template>
    <div class="row">
        <div class="col-lg-12">
            <div class="card">
                <div class="card-body p-0">
                    <div class="iq-edit-list usr-edit">
                        <ul class="iq-edit-profile d-flex nav nav-pills">
                            <li class="col-md-3 p-0">
                                <a class="nav-link active" data-toggle="pill" href="#personal-information">
                                    {{ $t('personal_information') }}
                                </a>
                            </li>
                            <li class="col-md-3 p-0">
                                <a class="nav-link" data-toggle="pill" href="#chang-pwd">
                                    {{ $t('change_password') }}
                                </a>
                            </li>
                            <li class="col-md-3 p-0">
                                <a class="nav-link" data-toggle="pill" href="#manage-contact">
                                    {{ $t('manage_contact') }}
                                </a>
                            </li>
                            <li class="col-md-3 p-0" v-if="hasPermission('can_access_business_info')">
                                <a class="nav-link" data-toggle="pill" href="#business-details">
                                    {{ $t('business_details') }}
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-lg-12">
            <div class="iq-edit-list-data">
                <div class="tab-content">
                    <div class="tab-pane fade active show" id="personal-information" role="tabpanel">
                        <div class="card">
                            <div class="card-header d-flex justify-content-between">
                                <div class="header-title">
                                    <h4 class="card-title">{{ $t('personal_information') }}</h4>
                                </div>
                                <RouterLink to="/profile" class="btn btn-sm btn-outline-secondary">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24"
                                        stroke-width="1.5" stroke="currentColor" class="size-6">
                                        <path stroke-linecap="round" stroke-linejoin="round"
                                            d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
                                    </svg>
                                    {{ $t('back') }}
                                </RouterLink>
                            </div>
                            <div class="card-body">
                                <Form @submit="onSubmitPersonal" :validation-schema="personalSchema">
                                    <div class="form-group row align-items-center">
                                        <div class="col-md-12">
                                            <div class="profile-img-edit">
                                                <div class="crm-profile-img-edit">
                                                    <img class="crm-profile-pic rounded-circle avatar-100"
                                                        :src="profileImage || defaultProfilePic" alt="profile-pic">
                                                    <div class="crm-p-image bg-primary" @click="openFileChooser">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" fill="none"
                                                            viewBox="0 0 24 24" stroke="currentColor">
                                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                                stroke-width="2"
                                                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                        </svg>
                                                        <input ref="fileInput" class="file-upload" type="file"
                                                            accept="image/*" @change="onFileChange">
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row align-items-center">
                                        <div class="form-group col-sm-6">
                                            <label for="fname">{{ $t('first_name') }}</label>
                                            <Field name="firstName" type="text" class="form-control" id="fname"
                                                v-model="personalData.firstName" />
                                            <ErrorMessage name="firstName" class="text-danger" />
                                        </div>
                                        <div class="form-group col-sm-6">
                                            <label for="lname">{{ $t('last_name') }}</label>
                                            <Field name="lastName" type="text" class="form-control" id="lname"
                                                v-model="personalData.lastName" />
                                            <ErrorMessage name="lastName" class="text-danger" />
                                        </div>
                                        <div class="form-group col-sm-6">
                                            <label for="language">{{ $t('select_your_default_language') }}</label>
                                            <Field name="languageId" as="select" class="form-control" id="language"
                                                v-model="personalData.languageId">
                                                <option value="" disabled>{{ $t('select_language') }}</option>
                                                <option v-for="language in languages" :key="language.id"
                                                    :value="language.id">{{ language.name }}</option>
                                            </Field>
                                            <ErrorMessage name="languageId" class="text-danger" />
                                        </div>
                                        <div class="form-group col-sm-6">
                                            <label for="timezone">{{ $t('select_your_timezone') }}</label>
                                            <Field name="timezoneId" as="select" class="form-control" id="timezone"
                                                v-model="personalData.timezoneId">
                                                <option value="" disabled>{{ $t('select_timezone') }}</option>
                                                <option v-for="timezone in timezones" :key="timezone.id"
                                                    :value="timezone.id">{{ timezone.label }}</option>
                                            </Field>
                                            <ErrorMessage name="timezoneId" class="text-danger" />
                                        </div>
                                        <div class="form-group col-sm-6">
                                            <label for="country">{{ $t('country') }}</label>
                                            <Field name="countryId" as="select" class="form-control" id="country"
                                                v-model="personalData.countryId">
                                                <option value="" disabled>{{ $t('select_country') }}</option>
                                                <option v-for="country in countries" :key="country.id"
                                                    :value="country.id">{{ country.name }}</option>
                                            </Field>
                                            <ErrorMessage name="countryId" class="text-danger" />
                                        </div>
                                        <div class="form-group col-sm-6">
                                            <label for="gender">{{ $t('gender') }}</label>
                                            <Field name="gender" as="select" class="form-control" id="gender"
                                                v-model="personalData.gender">
                                                <option value="" disabled>{{ $t('select_gender') }}</option>
                                                <option value="0">{{ $t('male') }}</option>
                                                <option value="1">{{ $t('female') }}</option>
                                            </Field>
                                            <ErrorMessage name="gender" class="text-danger" />
                                        </div>
                                        <div class="form-group col-sm-6">
                                            <label for="city">{{ $t('city') }}</label>
                                            <Field name="city" type="text" class="form-control" id="city"
                                                v-model="personalData.city" />
                                            <ErrorMessage name="city" class="text-danger" />
                                        </div>
                                        <div class="form-group col-sm-6">
                                            <label for="state">{{ $t('state') }}</label>
                                            <Field name="stateId" as="select" class="form-control" id="state"
                                                v-model="personalData.stateId">
                                                <option value="" disabled>{{ $t('select_state') }}</option>
                                                <option v-for="state in states" :key="state.id" :value="state.id">{{
                                                    state.name }}</option>
                                            </Field>
                                            <ErrorMessage name="stateId" class="text-danger" />
                                        </div>
                                    </div>
                                    <button type="reset" class="btn btn-outline-primary mr-2">{{ $t('cancel')
                                        }}</button>
                                    <button type="submit" class="btn btn-primary" :disabled="loading">
                                        <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"
                                            aria-hidden="true"></span>
                                        {{ loading ? $t('submitting') : $t('submit') }}
                                    </button>
                                </Form>
                            </div>
                        </div>
                    </div>
                    <div class="tab-pane fade" id="chang-pwd" role="tabpanel">
                        <div class="card">
                            <div class="card-header d-flex justify-content-between">
                                <div class="header-title">
                                    <h4 class="card-title">{{ $t('change_password') }}</h4>
                                </div>
                            </div>
                            <div class="card-body">
                                <Form ref="passwordFormRef" @submit="onSubmitPassword" enctype="multipart/form-data"
                                    :validation-schema="passwordSchema">
                                    <div class="form-group col-md-6">
                                        <label for="cpass">{{ $t('current_password') }}</label>
                                        <Field name="currentPassword" type="password" class="form-control" id="cpass" />
                                        <ErrorMessage name="currentPassword" class="text-danger" />
                                    </div>
                                    <div class="form-group col-md-6">
                                        <label for="npass">{{ $t('new_password') }}</label>
                                        <Field name="newPassword" type="password" class="form-control" id="npass" />
                                        <ErrorMessage name="newPassword" class="text-danger" />
                                    </div>
                                    <div class="form-group col-md-6">
                                        <label for="vpass">{{ $t('verify_password') }}</label>
                                        <Field name="confirmPassword" type="password" class="form-control" id="vpass" />
                                        <ErrorMessage name="confirmPassword" class="text-danger" />
                                    </div>
                                    <div class="col-md-6">
                                        <button type="reset" class="btn btn-outline-primary mr-2">{{ $t('cancel')
                                        }}</button>
                                        <button type="submit" class="btn btn-primary" :disabled="loading">
                                            <span v-if="loading" class="spinner-border spinner-border-sm me-2"
                                                role="status" aria-hidden="true"></span>
                                            {{ loading ? $t('submitting') : $t('submit') }}
                                        </button>
                                    </div>

                                </Form>
                            </div>
                        </div>
                    </div>
                    <div class="tab-pane fade" id="manage-contact" role="tabpanel">
                        <div class="card">
                            <div class="card-header d-flex justify-content-between">
                                <div class="header-title">
                                    <h4 class="card-title">{{ $t('manage_contact') }}</h4>
                                </div>
                            </div>
                            <div class="card-body">
                                <div class="form-group col-md-6">
                                    <label for="cno">{{ $t('contact_number') }}</label>
                                    <small v-if="isPhoneNumberChanged" class="form-text text-warning d-block mb-1">
                                        {{ $t('number_change_verification_notice') }}
                                    </small>
                                    <div class="d-flex align-items-start">
                                        <div class="flex-grow-1 mr-2">
                                            <IntlTelInput v-model="phoneNumber" ref="phoneNumberRef" :inputProps="{
                                                class: 'form-control',
                                                placeholder: $t('enter_mobile_number')
                                            }" initial-country="auto" :geo-ip-lookup="geoIpLookup"
                                                :load-utils="() => import('intl-tel-input/utils')" />
                                        </div>
                                        <div class="">
                                            <span v-if="isMobileVerified && !isPhoneNumberChanged"
                                                class="input-group-text bg-success text-white">
                                                <i class="fas fa-check"></i> {{ $t('verified') }}
                                            </span>
                                            <button v-else type="button" class="btn btn-outline-warning"
                                                @click="confirmVerifyMobile" :disabled="props.verifyingMobile">
                                                {{ props.verifyingMobile ? $t('sending') : $t('verify') }}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div class="form-group col-md-6">
                                    <label for="email">{{ $t('email') }}</label>
                                    <small class="form-text text-muted d-block mb-1">
                                        {{ $t('email_change_notice') }}
                                    </small>
                                    <div class="d-flex align-items-start">
                                        <div class="flex-grow-1 mr-2">
                                            <input type="email" class="form-control" id="email"
                                                v-model="contactData.email" />
                                        </div>
                                        <div class="">
                                            <span v-if="isEmailVerified" class="input-group-text bg-success text-white">
                                                <i class="fas fa-check"></i> {{ $t('verified') }}
                                            </span>
                                            <button v-else type="button" class="btn btn-outline-warning"
                                                @click="confirmVerifyEmail(contactData.email)"
                                                :disabled="props.verifyingEmail">
                                                {{ props.verifyingEmail ? $t('sending') : $t('verify') }}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="tab-pane fade" id="business-details" role="tabpanel"
                        v-if="hasPermission('can_access_business_info')">
                        <div class="card">
                            <div class="card-header d-flex justify-content-between">
                                <div class="header-title">
                                    <h4 class="card-title">{{ $t('business_details') }}</h4>
                                </div>
                            </div>
                            <div class="card-body">
                                <Form ref="businessForm" @submit="onSubmitBusiness" :validation-schema="businessSchema"
                                    :initialValues="businessData">
                                    <div class="form-group row align-items-center">
                                        <div class="col-md-12">
                                            <div class="profile-img-edit">
                                                <div class="crm-profile-img-edit">
                                                    <img class="crm-profile-pic rounded-circle avatar-100"
                                                        :src="businessLogo || defaultProfilePic" alt="business-logo">
                                                    <div class="crm-p-image bg-primary"
                                                        @click="openBusinessLogoChooser">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" fill="none"
                                                            viewBox="0 0 24 24" stroke="currentColor">
                                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                                stroke-width="2"
                                                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                        </svg>
                                                        <input ref="businessLogoFileInput" class="file-upload"
                                                            type="file" accept="image/*" @change="onBusinessLogoChange">
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row align-items-center">
                                        <div class="form-group col-sm-6">
                                            <label for="business_name">{{ $t('business_name') }}</label>
                                            <Field name="businessName" type="text" class="form-control"
                                                id="business_name" v-model="businessData.businessName" />
                                            <ErrorMessage name="businessName" class="text-danger" />
                                        </div>
                                        <div class="form-group col-sm-6">
                                            <label for="website">{{ $t('website') }}</label>
                                            <Field name="website" type="url" class="form-control" id="website"
                                                v-model="businessData.website" />
                                            <ErrorMessage name="website" class="text-danger" />
                                        </div>
                                        <div class="form-group col-sm-6">
                                            <label for="timezone">{{ $t('select_your_timezone') }}</label>
                                            <Field name="timezoneId" as="select" class="form-control" id="timezone"
                                                v-model="businessData.timezoneId">
                                                <option value="" disabled>{{ $t('select_timezone') }}</option>
                                                <option v-for="timezone in timezones" :key="timezone.id"
                                                    :value="timezone.id">{{ timezone.label }}</option>
                                            </Field>
                                            <ErrorMessage name="timezoneId" class="text-danger" />
                                        </div>
                                        <div class="form-group col-sm-6">
                                            <label for="country">{{ $t('country') }}</label>
                                            <Field name="countryId" as="select" class="form-control" id="country"
                                                v-model="businessData.countryId">
                                                <option value="" disabled>{{ $t('select_country') }}</option>
                                                <option v-for="country in countries" :key="country.id"
                                                    :value="country.id">{{ country.name }}</option>
                                            </Field>
                                            <ErrorMessage name="countryId" class="text-danger" />
                                        </div>
                                        <div class="form-group col-sm-6">
                                            <label for="city">{{ $t('city') }}</label>
                                            <Field name="city" type="text" class="form-control" id="city"
                                                v-model="businessData.city" />
                                            <ErrorMessage name="city" class="text-danger" />
                                        </div>
                                        <div class="form-group col-sm-6">
                                            <label for="business_state">{{ $t('state') }}</label>
                                            <Field name="stateId" as="select" class="form-control" id="business_state"
                                                v-model="businessData.stateId">
                                                <option value="" disabled>{{ $t('select_state') }}</option>
                                                <option v-for="state in businessStates" :key="state.id"
                                                    :value="state.id">{{
                                                        state.name }}</option>
                                            </Field>
                                            <ErrorMessage name="stateId" class="text-danger" />
                                        </div>
                                        <div class="form-group col-sm-6">
                                            <label for="address">{{ $t('address') }}</label>
                                            <Field name="address" type="text" class="form-control" id="address"
                                                v-model="businessData.address" />
                                            <ErrorMessage name="address" class="text-danger" />
                                        </div>

                                        <div class="form-group col-sm-3">
                                            <label>{{ $t('account_type') }}</label>
                                            <br>
                                            <span class="badge badge-primary">{{ businessData.accountType }}</span>
                                        </div>
                                        <div class="form-group col-sm-3">
                                            <label>{{ $t('service_type') }}</label>
                                            <br>
                                            <span class="badge badge-secondary">{{ businessData.serviceType }}</span>
                                        </div>
                                        <div class="form-group col-sm-3">
                                            <label>{{ $t('status') }}</label>
                                            <br>
                                            <span class="badge badge-success">{{ businessData.status }}</span>
                                        </div>
                                        <div class="form-group col-sm-3">
                                            <label>{{ $t('active_package') }}</label>
                                            <br>
                                            <span class="badge badge-info">{{ businessData.activePackage }}</span>
                                        </div>
                                        <div class="form-group col-sm-6">
                                            <label>{{ $t('company_category') }}</label>
                                            <div class="row">
                                                <div class="col-md-6" v-for="category in businessCategories"
                                                    :key="category.id">
                                                    <div class="form-check">
                                                        <Field :id="'category-' + category.id" name="categories"
                                                            type="checkbox" class="form-check-input"
                                                            :value="category.id" />
                                                        <label class="form-check-label"
                                                            :for="'category-' + category.id">
                                                            {{ category.name }}
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                            <ErrorMessage name="categories" class="text-danger" />
                                        </div>
                                    </div>
                                    <button type="reset" class="btn btn-outline-primary mr-2">{{ $t('cancel')
                                    }}</button>
                                    <button type="submit" class="btn btn-primary"
                                        :disabled="loading || !hasPermission('can_update_business_info')"
                                        v-tooltip="!hasPermission('can_update_business_info') ? { text: $t('no_permission_to_update'), placement: 'top' } : { text: $t('save'), placement: 'top' }">
                                        <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"
                                            aria-hidden="true"></span>
                                        {{ loading ? $t('submitting') : $t('submit') }}
                                    </button>
                                </Form>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, watch, computed, nextTick } from 'vue'
import IntlTelInput from "intl-tel-input/vue";
import "intl-tel-input/styles";
import { Form, Field, ErrorMessage, useForm } from 'vee-validate'
import * as yup from 'yup'
import Swal from 'sweetalert2'
import defaultProfilePic from '../../assets/images/profile.png'
import { getStates } from '../../services/authService'
import { showErrorAlert } from '../../helpers/swal'
import { useI18n } from 'vue-i18n'
import { hasPermission } from '../../helpers/authHelper'
import { useAuthStore } from "../../stores/authStore";

const { t } = useI18n()
const authStore = useAuthStore()
const props = defineProps({
    profileData: Object,
    loading: Boolean,
    verifyingEmail: {
        type: Boolean,
        default: false
    },
    verifyingMobile: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['updateProfile', 'changePassword', 'verifyMobile', 'verifyEmail', 'updateBusiness'])

const profileImage = ref(null)
const businessLogo = ref(null)
const passwordFormRef = ref(null)
const fileInput = ref(null)
const selectedProfileFile = ref(null)
const businessLogoFileInput = ref(null)
const selectedBusinessLogoFile = ref(null)
const businessForm = ref(null)
const { resetForm } = useForm()

const phoneNumber = ref(null)
const phoneNumberRef = ref(null)
const originalPhoneNumber = ref(null)

// Sync phoneNumber to contactData.contactNumber
watch(phoneNumber, (newVal) => {
    if (newVal) {
        contactData.contactNumber = newVal
    }
})

const geoIpLookup = (success, failure) => {
    fetch("https://ipapi.co/json")
        .then(res => res.json())
        .then(data => success(data.country_code))
        .catch(() => failure());
};

const personalData = reactive({
    firstName: '',
    lastName: '',
    languageId: '',
    timezoneId: '',
    countryId: '',
    gender: '',
    city: '',
    stateId: ''
})

const countries = ref([])
const languages = ref([])
const timezones = ref([])
const states = ref([])
const businessStates = ref([])
const isCountryInitialized = ref(false)
const isBusinessCountryInitialized = ref(false)

const passwordData = reactive({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
})
const resetPasswordFields = () => {
    passwordFormRef.value?.resetForm({
        values: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        }
    })
}
defineExpose({
    resetPasswordFields
})

const contactData = reactive({
    contactNumber: '',
    email: ''
})

const businessData = reactive({
    businessName: '',
    website: '',
    timezoneId: '',
    countryId: '',
    city: '',
    stateId: '',
    address: '',
    categories: [],
    accountType: '',
    serviceType: '',
    status: '',
    activePackage: ''
})

const businessCategories = ref([])
const currentBusinessId = ref(null)

const isEmailVerified = computed(() => {
    return props.profileData?.profileDetails?.email_verified_at != null
})

const isMobileVerified = computed(() => {
    return props.profileData?.profileDetails?.is_mobile_verified === 1 || props.profileData?.profileDetails?.is_mobile_verified === true
})

const isPhoneNumberChanged = computed(() => {
    return originalPhoneNumber.value && phoneNumber.value && phoneNumber.value !== originalPhoneNumber.value
})



// Populate data when profileData changes
watch(() => props.profileData, async (newData) => {
    if (newData) {
        Object.assign(personalData, {
            firstName: newData.profileDetails?.first_name || '',
            lastName: newData.profileDetails?.last_name || '',
            languageId: newData.profileDetails?.language_id ?? '',
            timezoneId: newData.profileDetails?.timezone_id ?? '',
            countryId: newData.profileDetails?.country_id ?? '',
            gender: newData.profileDetails?.gender ?? '',
            city: newData.profileDetails?.city || '',
            stateId: newData.profileDetails?.state_id ?? '',
        })

        countries.value = Array.isArray(newData.countries) ? newData.countries : []
        languages.value = Array.isArray(newData.languages) ? newData.languages : []
        timezones.value = Array.isArray(newData.timezones) ? newData.timezones : []

        Object.assign(contactData, {
            contactNumber: newData.profileDetails?.mobile_number ?? '',
            email: newData.profileDetails?.email ?? ''
        })

        // Set phone number for IntlTelInput
        if (newData.profileDetails?.mobile_number) {
            phoneNumber.value = newData.profileDetails.mobile_number
            originalPhoneNumber.value = newData.profileDetails.mobile_number
        }
        profileImage.value = newData.profileDetails?.profile_pic || null

        // Fetch states for the country on initial load
        if (newData.profileDetails?.country_id) {
            try {
                const response = await getStates(newData.profileDetails.country_id)
                states.value = response.data || []
                isCountryInitialized.value = true
            } catch (error) {
                console.error('Error fetching states:', error)
                states.value = []
            }
        }

        // Find matching business from businesses array
        const matchedBusiness = newData.profileDetails?.businesses?.find(business => business.id === authStore.company?.id)
        currentBusinessId.value = matchedBusiness?.id || null

        // Business data
        Object.assign(businessData, {
            businessName: matchedBusiness?.business_name || '',
            website: matchedBusiness?.website || '',
            timezoneId: matchedBusiness?.timezone_id || personalData.timezoneId || '',
            countryId: matchedBusiness?.country_id || personalData.countryId || '',
            city: matchedBusiness?.city || personalData.city || '',
            stateId: matchedBusiness?.state_id || personalData.stateId || '',
            address: matchedBusiness?.address || '',
            categories: matchedBusiness?.categories?.map(c => c.id) || [],
            accountType: matchedBusiness?.account_type_name || '',
            serviceType: matchedBusiness?.service_type_name || '',
            status: matchedBusiness?.status_name || '',
            activePackage: matchedBusiness?.subscription?.package?.name || ''
        })

        // Update form values
        nextTick(() => {
            businessForm.value?.setValues(businessData)
        })

        businessCategories.value = Array.isArray(newData.business_categories) ? newData.business_categories : []
        businessLogo.value = matchedBusiness?.business_logo_url || null

        // Fetch business states for the country on initial load
        if (businessData.countryId) {
            try {
                const response = await getStates(businessData.countryId)
                businessStates.value = response.data || []
                isBusinessCountryInitialized.value = true
            } catch (error) {
                console.error('Error fetching business states:', error)
                businessStates.value = []
            }
        }
    }
}, { immediate: true })

// Watch for manual country change to reset state and refetch
watch(() => personalData.countryId, async (newCountryId, oldCountryId) => {
    // Skip if this is the initial load (already handled by profileData watcher)
    if (!isCountryInitialized.value) {
        return
    }

    // Handle user-triggered country change
    if (newCountryId && oldCountryId && newCountryId !== oldCountryId) {
        try {
            const response = await getStates(newCountryId)
            states.value = response.data || []
            personalData.stateId = '' // Reset state selection when country changes
        } catch (error) {
            console.error('Error fetching states:', error)
            states.value = []
        }
    } else if (!newCountryId) {
        states.value = []
        personalData.stateId = ''
    }
})

// Watch for business country change
watch(() => businessData.countryId, async (newCountryId, oldCountryId) => {
    // Skip if this is the initial load (already handled by profileData watcher)
    if (!isBusinessCountryInitialized.value) {
        return
    }

    // Handle user-triggered country change
    if (newCountryId && oldCountryId && newCountryId !== oldCountryId) {
        try {
            const response = await getStates(newCountryId)
            // Use separate states for business
            businessStates.value = response.data || []
            businessData.stateId = '' // Reset state selection when country changes
        } catch (error) {
            console.error('Error fetching states:', error)
            businessStates.value = []
        }
    } else if (!newCountryId) {
        businessStates.value = []
        businessData.stateId = ''
    }
})

const personalSchema = yup.object({
    firstName: yup.string().required('First Name is required'),
    lastName: yup.string().required('Last Name is required'),
    languageId: yup.string().required('Language is required'),
    timezoneId: yup.string().required('Timezone is required'),
    countryId: yup.string().required('Country is required'),
    gender: yup.string().required('Gender is required'),
    city: yup.string().required('City is required'),
    stateId: yup.string().required('State is required')
})

const passwordSchema = yup.object({
    currentPassword: yup.string().required('Current Password is required'),
    newPassword: yup.string().min(8, 'Minimum 8 characters').required('New Password is required'),
    confirmPassword: yup.string().oneOf([yup.ref('newPassword'), null], 'Passwords must match').required('Confirm Password is required')
})

const businessSchema = yup.object({
    businessName: yup.string().required('Business Name is required'),
    website: yup.string().url('Enter a valid website URL'),
    timezoneId: yup.string().required('Timezone is required'),
    countryId: yup.string().required('Country is required'),
    city: yup.string().required('City is required'),
    stateId: yup.string().required('State is required'),
    address: yup.string().required('Address is required'),
    categories: yup.array().min(1, 'Select at least one category')
})

const openFileChooser = () => {
    fileInput.value?.click()
}

const onFileChange = (event) => {
    const file = event.target.files?.[0]
    if (file) {
        // Validate file type (must be image)
        const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
        if (!allowedImageTypes.includes(file.type)) {
            showErrorAlert(t('image_not_allowed'))
            fileInput.value.value = '' // Clear input
            return
        }

        // Validate file size (max 5MB)
        const maxFileSize = 5 * 1024 * 1024 // 5MB in bytes
        if (file.size > maxFileSize) {
            showErrorAlert(t('file_size_exceeded'))
            fileInput.value.value = '' // Clear input
            return
        }

        // If validation passes, use the file
        selectedProfileFile.value = file
        profileImage.value = URL.createObjectURL(file)

    }
}

const openBusinessLogoChooser = () => {
    businessLogoFileInput.value?.click()
}

const onBusinessLogoChange = (event) => {
    const file = event.target.files?.[0]
    if (file) {
        // Validate file type (must be image)
        const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
        if (!allowedImageTypes.includes(file.type)) {
            showErrorAlert(t('image_not_allowed'))
            businessLogoFileInput.value.value = '' // Clear input
            return
        }

        // Validate file size (max 5MB)
        const maxFileSize = 5 * 1024 * 1024 // 5MB in bytes
        if (file.size > maxFileSize) {
            showErrorAlert(t('file_size_exceeded'))
            businessLogoFileInput.value.value = '' // Clear input
            return
        }

        // If validation passes, use the file
        selectedBusinessLogoFile.value = file
        businessLogo.value = URL.createObjectURL(file)

    }
}

const onSubmitPersonal = (values) => {
    emit('updateProfile', {
        first_name: values.firstName,
        last_name: values.lastName,
        language_id: values.languageId,
        timezone_id: values.timezoneId,
        country_id: values.countryId,
        gender: values.gender,
        city: values.city,
        state_id: values.stateId,
        profileFile: selectedProfileFile.value
    })
}

const onSubmitPassword = (values) => {
    emit('changePassword', values)
}

const onSubmitBusiness = (values) => {

    emit('updateBusiness', {
        business_id: currentBusinessId.value,
        business_name: values.businessName,
        website: values.website,
        timezone_id: values.timezoneId,
        country_id: values.countryId,
        city: values.city,
        state_id: values.stateId,
        address: values.address,
        categories: values.categories,
        businessLogoFile: selectedBusinessLogoFile.value
    })
}

const confirmVerifyEmail = async (email) => {
    const result = await Swal.fire({
        title: t('confirm_email_verification'),
        html: t('email_verification_consent'),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: t('yes_verify'),
        cancelButtonText: t('cancel')
    })
    if (result.isConfirmed) {
        emit('verifyEmail', email)
    }
}

const confirmVerifyMobile = async () => {
    const result = await Swal.fire({
        title: t('confirm_mobile_verification'),
        html: t('mobile_verification_consent'),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: t('yes_verify'),
        cancelButtonText: t('cancel')
    })
    if (result.isConfirmed) {
        emit('verifyMobile', phoneNumber.value)
    }
}
</script>

<style scoped>
:deep(.iti) {
    width: 100%;
}

:deep(.iti__dropdown-content) {
    z-index: 1000 !important;
}
</style>