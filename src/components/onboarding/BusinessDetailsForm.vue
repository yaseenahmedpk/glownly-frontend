<script setup>
import { ref } from 'vue'
import { Form, Field, ErrorMessage } from 'vee-validate'
import * as yup from 'yup'

const showOtherCategory = ref(false)

defineProps({
    categories: {
        type: Array,
        default: () => []
    },
    loading: {
        type: Boolean,
        default: false
    }
})

const schema = yup.object({
    business_name: yup
        .string()
        .required('Business name is required'),

    website: yup
        .string()
        .url('Enter a valid website URL')
        .nullable(),

    categories: yup
        .array()
        .min(1, 'Please select at least one category'),

    other_category: yup
        .string()
        .when([], {
            is: () => showOtherCategory.value,
            then: (schema) =>
                schema.required('Other category is required'),
            otherwise: (schema) => schema.nullable()
        }),

    account_type: yup
        .string()
        .required('Please select account type'),

    service_type: yup
        .string()
        .required('Please select service type')
})
const emit = defineEmits(['businessSubmit']);
const submitForm = (values) => {
    const payload = {
        ...values,
        categories: showOtherCategory.value
            ? [...values.categories, values.other_category]
            : values.categories
    }
    emit('businessSubmit', payload);
}
</script>
<template>
    <Form @submit="submitForm" :validation-schema="schema">
        <!-- Business Name -->
        <div class="mb-3">
            <label class="form-label fw-semibold">
                {{ $t('business_name') }}
            </label>

            <Field name="business_name" type="text" class="form-control" :placeholder="$t('enter_business_name')" />

            <ErrorMessage name="business_name" class="text-danger small" />
        </div>

        <!-- Website -->
        <div class="mb-3">
            <label class="form-label fw-semibold">
                {{ $t('website') }}
            </label>

            <Field name="website" type="url" class="form-control" placeholder="https://example.com" />

            <ErrorMessage name="website" class="text-danger small" />
        </div>

        <!-- Categories -->
        <div class="mb-4">
            <label class="form-label fw-semibold">
                {{ $t('company_category') }}
            </label>

            <div class="row">
                <div class="col-md-4 mb-2" v-for="category in categories" :key="category.id">
                    <div class="form-check">
                        <Field :id="'category-' + category.id" name="categories" type="checkbox" class="form-check-input"
                            :value="category.id" />

                        <label class="form-check-label" :for="'category-' + category.id">
                            {{ category.name }}
                        </label>
                    </div>
                </div>
            </div>

            <ErrorMessage name="categories" class="text-danger small d-block mt-1" />

            <!-- Other Category -->
            <div class="mt-3">
                <div class="form-check mb-2">
                    <input id="other-category" type="checkbox" class="form-check-input" v-model="showOtherCategory" />

                    <label for="other-category" class="form-check-label">
                        Other
                    </label>
                </div>

                <Field v-if="showOtherCategory" name="other_category" type="text" class="form-control"
                    :placeholder="$t('other_category')" />

                <ErrorMessage name="other_category" class="text-danger small" />
            </div>
        </div>

        <!-- Account Type -->
        <div class="mb-4">
            <label class="form-label fw-semibold">
                {{ $t('company_account_type') }}
            </label>

            <p class="text-muted small mb-3">
                {{ $t('company_account_type_message') }}
            </p>

            <div class="form-check mb-2">
                <Field id="independent" name="account_type" type="radio" class="form-check-input" value="1" />

                <label class="form-check-label" for="independent">
                    {{ $t('independent') }}
                </label>
            </div>

            <div class="form-check">
                <Field id="team" name="account_type" type="radio" class="form-check-input" value="2" />

                <label class="form-check-label" for="team">
                    {{ $t('team') }}
                </label>
            </div>

            <ErrorMessage name="account_type" class="text-danger small d-block mt-1" />
        </div>

        <!-- Service Type -->
        <div class="mb-4">
            <label class="form-label fw-semibold">
                {{ $t('company_service_location') }}
            </label>

            <div class="form-check mb-2">
                <Field id="physical-location" name="service_type" type="radio" class="form-check-input"
                    value="1" />

                <label class="form-check-label" for="physical-location">
                    {{ $t('company_physical') }}
                </label>
            </div>

            <div class="form-check">
                <Field id="mobile-operator" name="service_type" type="radio" class="form-check-input"
                    value="2" />

                <label class="form-check-label" for="mobile-operator">
                    {{ $t('mobile_operator') }}
                </label>
            </div>

            <ErrorMessage name="service_type" class="text-danger small d-block mt-1" />
        </div>

        <!-- Submit -->
        <button type="submit" class="btn btn-primary px-4" :disabled="loading">
            {{ loading ? $t('saving') : $t('continue') }}
        </button>
    </Form>
</template>