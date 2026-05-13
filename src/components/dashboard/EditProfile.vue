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
                                <a class="nav-link" data-toggle="pill" href="#emailandsms">
                                    {{ $t('email_and_sms') }}
                                </a>
                            </li>
                            <li class="col-md-3 p-0">
                                <a class="nav-link" data-toggle="pill" href="#manage-contact">
                                    {{ $t('manage_contact') }}
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
                            </div>
                            <div class="card-body">
                                <Form @submit="onSubmitPersonal" :validation-schema="personalSchema">
                                    <div class="form-group row align-items-center">
                                        <div class="col-md-12">
                                            <div class="profile-img-edit">
                                                <div class="crm-profile-img-edit">
                                                    <img class="crm-profile-pic rounded-circle avatar-100"
                                                        :src="profileImage || defaultProfilePic" alt="profile-pic">
                                                    <div class="crm-p-image bg-primary">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" fill="none"
                                                            viewBox="0 0 24 24" stroke="currentColor">
                                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                                stroke-width="2"
                                                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                        </svg>
                                                        <input class="file-upload" type="file" accept="image/*"
                                                            @change="onFileChange">
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
                                    <button type="submit" class="btn btn-primary" :disabled="loading">{{ $t('submit')
                                    }}</button>
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
                                <Form @submit="onSubmitPassword" :validation-schema="passwordSchema">
                                    <div class="form-group">
                                        <label for="cpass">{{ $t('current_password') }}</label>
                                        <a href="javascript:void();" class="float-right">{{ $t('forgot_password') }}</a>
                                        <Field name="currentPassword" type="password" class="form-control" id="cpass" />
                                        <ErrorMessage name="currentPassword" class="text-danger" />
                                    </div>
                                    <div class="form-group">
                                        <label for="npass">{{ $t('new_password') }}</label>
                                        <Field name="newPassword" type="password" class="form-control" id="npass" />
                                        <ErrorMessage name="newPassword" class="text-danger" />
                                    </div>
                                    <div class="form-group">
                                        <label for="vpass">{{ $t('verify_password') }}</label>
                                        <Field name="confirmPassword" type="password" class="form-control" id="vpass" />
                                        <ErrorMessage name="confirmPassword" class="text-danger" />
                                    </div>
                                    <button type="reset" class="btn btn-outline-primary mr-2">{{ $t('cancel')
                                    }}</button>
                                    <button type="submit" class="btn btn-primary" :disabled="loading">{{ $t('submit')
                                    }}</button>
                                </Form>
                            </div>
                        </div>
                    </div>
                    <div class="tab-pane fade" id="emailandsms" role="tabpanel">
                        <div class="card">
                            <div class="card-header d-flex justify-content-between">
                                <div class="header-title">
                                    <h4 class="card-title">{{ $t('email_and_sms') }}</h4>
                                </div>
                            </div>
                            <div class="card-body">
                                <Form @submit="onSubmitNotifications" :validation-schema="notificationSchema">
                                    <div class="form-group row align-items-center">
                                        <label class="col-md-3" for="emailnotification">{{ $t('email_notification')
                                        }}</label>
                                        <div class="col-md-9 custom-control custom-switch">
                                            <Field name="emailNotification" type="checkbox" class="custom-control-input"
                                                id="emailnotification" v-model="notificationData.emailNotification" />
                                            <label class="custom-control-label" for="emailnotification"></label>
                                        </div>
                                    </div>
                                    <div class="form-group row align-items-center">
                                        <label class="col-md-3" for="smsnotification">{{ $t('sms_notification')
                                        }}</label>
                                        <div class="col-md-9 custom-control custom-switch">
                                            <Field name="smsNotification" type="checkbox" class="custom-control-input"
                                                id="smsnotification" v-model="notificationData.smsNotification" />
                                            <label class="custom-control-label" for="smsnotification"></label>
                                        </div>
                                    </div>
                                    <div class="form-group row align-items-center">
                                        <label class="col-md-3" for="npass">{{ $t('when_to_email') }}</label>
                                        <div class="col-md-9">
                                            <div class="custom-control custom-checkbox">
                                                <Field name="emailNewNotifications" type="checkbox"
                                                    class="custom-control-input" id="email01"
                                                    v-model="notificationData.emailNewNotifications" />
                                                <label class="custom-control-label" for="email01">{{
                                                    $t('you_have_new_notifications') }}</label>
                                            </div>
                                            <div class="custom-control custom-checkbox">
                                                <Field name="emailDirectMessage" type="checkbox"
                                                    class="custom-control-input" id="email02"
                                                    v-model="notificationData.emailDirectMessage" />
                                                <label class="custom-control-label" for="email02">{{
                                                    $t('you_are_sent_a_direct_message') }}</label>
                                            </div>
                                            <div class="custom-control custom-checkbox">
                                                <Field name="emailConnection" type="checkbox"
                                                    class="custom-control-input" id="email03"
                                                    v-model="notificationData.emailConnection" />
                                                <label class="custom-control-label" for="email03">{{
                                                    $t('someone_adds_you_as_connection') }}</label>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="form-group row align-items-center">
                                        <label class="col-md-3" for="npass">{{ $t('when_to_escalate_emails') }}</label>
                                        <div class="col-md-9">
                                            <div class="custom-control custom-checkbox">
                                                <Field name="emailNewOrder" type="checkbox" class="custom-control-input"
                                                    id="email04" v-model="notificationData.emailNewOrder" />
                                                <label class="custom-control-label" for="email04">{{
                                                    $t('upon_new_order') }}</label>
                                            </div>
                                            <div class="custom-control custom-checkbox">
                                                <Field name="emailMembershipApproval" type="checkbox"
                                                    class="custom-control-input" id="email05"
                                                    v-model="notificationData.emailMembershipApproval" />
                                                <label class="custom-control-label" for="email05">{{
                                                    $t('new_membership_approval') }}</label>
                                            </div>
                                            <div class="custom-control custom-checkbox">
                                                <Field name="emailMemberRegistration" type="checkbox"
                                                    class="custom-control-input" id="email06"
                                                    v-model="notificationData.emailMemberRegistration" />
                                                <label class="custom-control-label" for="email06">{{
                                                    $t('member_registration') }}</label>
                                            </div>
                                        </div>
                                    </div>
                                    <button type="reset" class="btn btn-outline-primary mr-2">{{ $t('cancel')
                                    }}</button>
                                    <button type="submit" class="btn btn-primary" :disabled="loading">{{ $t('submit')
                                    }}</button>
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
                                <Form @submit="onSubmitContact" :validation-schema="contactSchema">
                                    <div class="form-group">
                                        <label for="cno">{{ $t('contact_number') }}</label>
                                        <Field name="contactNumber" type="text" class="form-control" id="cno"
                                            v-model="contactData.contactNumber" />
                                        <ErrorMessage name="contactNumber" class="text-danger" />
                                    </div>
                                    <div class="form-group">
                                        <label for="email">{{ $t('email') }}</label>
                                        <Field name="email" type="email" class="form-control" id="email"
                                            v-model="contactData.email" />
                                        <ErrorMessage name="email" class="text-danger" />
                                    </div>
                                    <div class="form-group">
                                        <label for="url">{{ $t('url') }}</label>
                                        <Field name="url" type="url" class="form-control" id="url"
                                            v-model="contactData.url" />
                                        <ErrorMessage name="url" class="text-danger" />
                                    </div>
                                    <button type="reset" class="btn btn-outline-primary mr-2">{{ $t('cancel')
                                    }}</button>
                                    <button type="submit" class="btn btn-primary" :disabled="loading">{{ $t('submit')
                                    }}</button>
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
import { ref, reactive, watch } from 'vue'
import { Form, Field, ErrorMessage } from 'vee-validate'
import * as yup from 'yup'
import defaultProfilePic from '../../assets/images/profile.png'
import { getStates } from '../../services/authService'

const props = defineProps({
    profileData: Object,
    loading: Boolean
})

const emit = defineEmits(['updateProfile', 'changePassword', 'updateNotifications', 'updateContact'])

const profileImage = ref(null)

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

const passwordData = reactive({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
})

const notificationData = reactive({
    emailNotification: true,
    smsNotification: true,
    emailNewNotifications: false,
    emailDirectMessage: false,
    emailConnection: true,
    emailNewOrder: false,
    emailMembershipApproval: false,
    emailMemberRegistration: true
})

const contactData = reactive({
    contactNumber: '',
    email: '',
    url: ''
})

// Populate data when profileData changes
watch(() => props.profileData, (newData) => {
    if (newData) {
        Object.assign(personalData, {
            firstName: newData.profileDetails?.first_name || '',
            lastName: newData.profileDetails?.last_name || '',
            languageId: newData.profileDetails?.language_id ?? '',
            timezoneId: newData.profileDetails?.timezone_id ?? '',
            countryId: newData.profileDetails?.country_id ?? '',
            gender: newData.profileDetails?.gender ?? '',
            city: newData.profileDetails?.city || '',
            stateId: newData.profileDetails?.state_id ?? ''
        })

        countries.value = Array.isArray(newData.countries) ? newData.countries : []
        languages.value = Array.isArray(newData.languages) ? newData.languages : []
        timezones.value = Array.isArray(newData.timezones) ? newData.timezones : []

        Object.assign(notificationData, newData.notifications || {})
        Object.assign(contactData, newData.contact || {})
        profileImage.value = newData.profileDetails?.user_profile_pic || null
    }
}, { immediate: true })

// Watch for country change to fetch states
watch(() => personalData.countryId, async (newCountryId) => {
    if (newCountryId) {
        try {
            const response = await getStates(newCountryId)
            states.value = response.data || []
        } catch (error) {
            console.error('Error fetching states:', error)
            states.value = []
        }
    } else {
        states.value = []
    }
    // Reset state when country changes
    personalData.stateId = ''
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

const notificationSchema = yup.object({
    // No required fields for notifications
})

const contactSchema = yup.object({
    contactNumber: yup.string().required('Contact Number is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    url: yup.string().url('Invalid URL').required('URL is required')
})

const onFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
        profileImage.value = URL.createObjectURL(file)
        // Handle file upload logic here, perhaps emit to parent
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
        profileImage: profileImage.value
    })
}

const onSubmitPassword = (values) => {
    emit('changePassword', values)
}

const onSubmitNotifications = (values) => {
    emit('updateNotifications', values)
}

const onSubmitContact = (values) => {
    emit('updateContact', values)
}
</script>

<style scoped>
/* Add any custom styles if needed */
</style>