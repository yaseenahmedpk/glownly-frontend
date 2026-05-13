<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import defaultLogo from '../../assets/images/glownly_logo.png'

const { t } = useI18n()

const props = defineProps({
  businesses: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['select', 'continue'])

const selectedBusinessId = ref(null)

const selectedBusiness = computed(() => {
  return props.businesses.find((business) => business.id === selectedBusinessId.value) || null
})

const selectBusiness = (business) => {
  selectedBusinessId.value = business.id
  emit('select', business)
}

const handleContinue = (business) => {
  selectedBusinessId.value = business.id
  emit('continue', business)
}
</script>

<template>
  <div class="business-selection">
    <div class="business-grid">
      <div
        v-for="business in businesses"
        :key="business.id"
        :class="['business-card', { selected: business.id === selectedBusinessId }]"
        @click="selectBusiness(business)"
      >
        <div class="business-card-left">
          <img
            :src="business.logo || defaultLogo"
            alt="business logo"
            class="business-logo"
          />
        </div>
        <div class="business-card-right">
          <div class="business-name">{{ business.name || business.title || t('business') }}</div>
          <button
            type="button"
            class="btn btn-primary btn-sm mt-3"
            @click.stop="handleContinue(business)"
          >
            {{ t('continue') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.business-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

@media (max-width: 768px) {
  .business-grid {
    grid-template-columns: 1fr;
  }
}
.business-card {
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 1rem;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}
.business-card:hover {
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
}
.business-card.selected {
  border-color: #0d6efd;
  background: rgba(13, 110, 253, 0.08);
}
.business-card-left {
  flex: 0 0 70px;
  height: 70px;
  width: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 1rem;
  background: #f8f9fa;
  margin-right: 1rem;
  overflow: hidden;
}
.business-logo {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
.business-card-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.business-name {
  font-weight: 700;
  font-size: 1rem;
  color: #212529;
}
</style>
