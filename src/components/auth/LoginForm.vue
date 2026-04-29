<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'

const form = reactive({
    email: '',
    password: ''
})
const emit = defineEmits(['login'])

const handleLogin = () => {
    emit('login', form)
}
</script>
<template>
    <form @submit.prevent="handleLogin">
        <div class="row">
            <div class="col-lg-12">
                <div class="form-group">
                    <label class="text-secondary">{{ $t('email') }}</label>
                    <input class="form-control" type="email" id="email" v-model="form.email" :placeholder="$t('enter_email')">
                </div>
            </div>
            <div class="col-lg-12 mt-2">
                <div class="form-group">
                    <div class="d-flex justify-content-between align-items-center">
                        <label class="text-secondary">{{ $t('password') }}</label>
                        <label><a href="auth-recover-pwd.html">{{ $t('forgot_password') }}</a></label>
                    </div>
                    <input class="form-control" type="password" id="password" v-model="form.password"
                        :placeholder="$t('enter_password')">
                </div>
            </div>
        </div>
        <button type="submit" class="btn btn-primary btn-block mt-2">{{ $t('sign_in') }}</button>
        <div class="col-lg-12 mt-3">
            <p class="mb-0 text-center"> {{ $t('dont_have_an_account') }} <RouterLink :to="`/signup`">{{ $t('sign_up') }}</RouterLink>
            </p>
        </div>
    </form>
</template>