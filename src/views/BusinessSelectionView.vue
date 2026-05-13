<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LanguageChanger from '../components/LanguageChanger.vue'
import BusinessSelection from '../components/business/BusinessSelection.vue'

const { t } = useI18n()
const authStore = useAuthStore()
const router = useRouter()

const businesses = computed(() => authStore.businesses || [])

const handleContinue = (business) => {
  authStore.setCompany(business)
  router.push('/dashboard')
}
</script>

<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-xl-8 col-lg-10">
        <div class="d-flex mb-3">
          <LanguageChanger />
        </div>
        <div class="text-center mb-4">
          <h2>{{ t('select_your_business') }}</h2>
          <p class="text-muted">{{ t('choose_business_to_access') }}</p>
        </div>
        <BusinessSelection :businesses="businesses" @continue="handleContinue" />
        <div v-if="businesses.length === 0" class="alert alert-warning text-center mt-4">
          No business available. Please contact your administrator.
        </div>
      </div>
    </div>
  </div>
</template>
