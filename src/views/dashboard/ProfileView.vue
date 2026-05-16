<template>
  <div>
    <div v-if="loading && Object.keys(profileData).length === 0"
        class="d-flex justify-content-center align-items-center" style="min-height: 300px;">
      <div class="text-center">
        <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;"></div>
      </div>
    </div>
    <Profile v-else :profileData="profileData" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getProfile } from '../../services/authService'
import { handleApiError } from '../../helpers/handleApiError'
import { showErrorAlert } from '../../helpers/swal'
import { useI18n } from 'vue-i18n'
import Profile from '../../components/dashboard/Profile.vue'

const { t } = useI18n()
const profileData = ref({})
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    const response = await getProfile()
    profileData.value = response.data
  } catch (err) {
    showErrorAlert(handleApiError(err, t))
  } finally {
    loading.value = false
  }
})
</script>
