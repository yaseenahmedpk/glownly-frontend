<script setup>
import { reactive } from 'vue'


const form = reactive({
    userEmail: ""
})
defineProps({
    loading: Boolean
})
const emit = defineEmits(['passwordForget'])

const handlePasswordForget = () => {
    emit('passwordForget', form)
}
</script>
<template>
    <form @submit.prevent="handlePasswordForget">
        <div class="row">
            <div class="col-lg-12">
                <div class="form-group">
                    <label class="text-secondary">{{ $t('email') }}</label>
                    <input v-model="form.userEmail" type="email" class="form-control" :placeholder="$t('enter_email')"
                        required>
                </div>

                <button type="submit" class="btn btn-primary w-100 d-flex justify-content-center align-items-center"
                    :disabled="loading">
                    <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"
                        aria-hidden="true"></span>

                    <span>
                        {{ loading ? $t('sending') : $t('send_reset_link') }}
                    </span>
                </button>

            </div>
        </div>
    </form>
</template>