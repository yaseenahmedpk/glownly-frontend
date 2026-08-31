<template>
  <div class="searchable-select" ref="containerRef">
    <div class="searchable-select-trigger" ref="triggerRef" @click.prevent="toggleDropdown" :class="{ 'is-open': isOpen }">
      <span class="searchable-select-value" :class="{ 'placeholder': !selectedLabel }">
        {{ selectedLabel || placeholder }}
      </span>
      <span class="searchable-select-arrow">▼</span>
    </div>
    <Transition name="searchable-select">
      <div v-if="isOpen" class="searchable-select-dropdown" ref="dropdownRef">
        <div class="searchable-select-search">
          <input
            ref="searchInput"
            type="text"
            v-model="searchQuery"
            class="form-control form-control-sm"
            :placeholder="searchPlaceholder"
            autocomplete="off"
            @keydown.esc="closeDropdown"
          />
        </div>
        <div class="searchable-select-options">
          <div
            v-for="option in filteredOptions"
            :key="option[valueKey]"
            class="searchable-select-option"
            :class="{ 'is-selected': option[valueKey] === modelValue }"
            @click.prevent="selectOption(option)"
          >
            {{ getLabel(option) }}
          </div>
          <div v-if="filteredOptions.length === 0" class="searchable-select-no-options">
            No options found
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  options: {
    type: Array,
    default: () => [],
  },
  labelKey: {
    type: String,
    default: 'name',
  },
  valueKey: {
    type: String,
    default: 'id',
  },
  placeholder: {
    type: String,
    default: 'Select...',
  },
  searchPlaceholder: {
    type: String,
    default: 'Search...',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  displayFn: {
    type: Function,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const searchQuery = ref('')
const containerRef = ref(null)
const triggerRef = ref(null)
const dropdownRef = ref(null)
const searchInput = ref(null)

const selectedLabel = computed(() => {
  if (!props.modelValue) return ''
  const option = props.options.find(o => o[props.valueKey] === props.modelValue)
  return option ? getLabel(option) : ''
})

const filteredOptions = computed(() => {
  if (!searchQuery.value) return props.options
  const q = searchQuery.value.toLowerCase()
  return props.options.filter(o => (getLabel(o) || '').toLowerCase().includes(q))
})

function getLabel(option) {
  if (props.displayFn) return props.displayFn(option)
  return option[props.labelKey] || ''
}

function selectOption(option) {
  emit('update:modelValue', option[props.valueKey])
  closeDropdown()
}

function toggleDropdown() {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    searchQuery.value = ''
    nextTick(() => {
      searchInput.value?.focus()
    })
  }
}

function closeDropdown() {
  isOpen.value = false
  searchQuery.value = ''
}

function handleClickOutside(e) {
  if (
    containerRef.value?.contains(e.target) ||
    triggerRef.value?.contains(e.target) ||
    dropdownRef.value?.contains(e.target)
  ) {
    return
  }
  closeDropdown()
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.searchable-select {
  position: relative;
  width: 100%;
}
.searchable-select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 38px;
  padding: 8px 36px 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  background: #fff;
  cursor: pointer;
  position: relative;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}
.searchable-select-trigger:hover {
  border-color: #80bfff;
}
.searchable-select-trigger.is-open {
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}
.searchable-select-value {
  font-size: 14px;
  color: #212529;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.searchable-select-value.placeholder {
  color: #6c757d;
}
.searchable-select-arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 10px;
  color: #6c757d;
  pointer-events: none;
  transition: transform 0.2s ease;
}
.searchable-select-trigger.is-open .searchable-select-arrow {
  transform: translateY(-50%) rotate(180deg);
}
.searchable-select-dropdown {
  position: absolute;
  top: calc(100% + 2px);
  left: 0;
  right: 0;
  z-index: 1050;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 0.25rem;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.175);
  max-height: 260px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.searchable-select-search {
  padding: 6px 8px;
  border-bottom: 1px solid #e9ecef;
}
.searchable-select-options {
  overflow-y: auto;
  padding: 4px 0;
  max-height: 200px;
}
.searchable-select-option {
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #212529;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.searchable-select-option:hover {
  background: #f1f5f9;
  color: #007bff;
}
.searchable-select-option.is-selected {
  background: #e7f1ff;
  color: #007bff;
  font-weight: 600;
}
.searchable-select-no-options {
  padding: 12px;
  text-align: center;
  color: #6c757d;
  font-size: 13px;
}
.searchable-select-enter-active,
.searchable-select-leave-active {
  transition: all 0.15s ease-in-out;
}
.searchable-select-enter-from,
.searchable-select-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
