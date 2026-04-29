<script setup>
import { reactive, computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const errorMessage = ref('')
const form = reactive({
    token: "",
    email: "",
    password: "",
    password_confirmation: ""
})
const props = defineProps({
    loading: Boolean,
    token: String,
    email: String
})
const emit = defineEmits(['passwordReset'])

const handlePasswordReset = () => {
    if (form.password !== form.password_confirmation) {
        errorMessage.value = t('passwords_do_not_match')
        return
    }
    emit('passwordReset', { ...form, token: props.token, email: props.email })
}
const passwordStrength = computed(() => {
    const val = form.password
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
const resetForm = () => {
    form.password = ""
    form.password_confirmation = ""
}
defineExpose({
    resetForm
})
</script>
<template>
    <form @submit.prevent="handlePasswordReset">
        <div class="row">
            <div class="col-lg-12">

                <div class="form-group">
                    <label class="text-secondary">{{ $t('password') }}</label>
                    <input v-model="form.password" type="password" class="form-control"
                        :placeholder="$t('enter_password')" required>
                    <div v-if="form.password" class="mt-2">
                        <div class="progress" style="height: 5px;">
                            <div class="progress-bar" :class="`bg-${passwordStrength.color}`" role="progressbar"
                                :style="{ width: (passwordStrength.score * 20) + '%' }"></div>
                        </div>

                        <small :class="`text-${passwordStrength.color}`">
                            {{ passwordStrength.label }} password
                        </small>
                    </div>
                </div>
                <div class="form-group">
                    <label class="text-secondary">{{ $t('confirm_password') }}</label>
                    <input v-model="form.password_confirmation" type="password" class="form-control"
                        :placeholder="$t('enter_confirm_password')" required>
                    <div v-if="errorMessage" class="text-danger mt-2">
                        {{ errorMessage }}
                    </div>
                </div>
                <button type="submit" class="btn btn-primary w-100 d-flex justify-content-center align-items-center"
                    :disabled="loading">
                    <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"
                        aria-hidden="true"></span>
                    <span>
                        {{ loading ? $t('changing_password') : $t('change_password') }}
                    </span>
                </button>
            </div>
        </div>
    </form>
</template>