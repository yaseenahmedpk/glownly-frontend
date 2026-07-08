<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
    modelValue: {
        type: [Array, String, Number],
        default: () => [],
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
    multiple: {
        type: Boolean,
        default: false,
    },
    placeholder: {
        type: String,
        default: 'Select...',
    },
});

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);
const searchQuery = ref('');
const dropdownRef = ref(null);
const triggerRef = ref(null);

const selectedValue = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val),
});

const selectedLabels = computed(() => {
    if (!props.multiple) {
        const option = props.options.find(o => o[props.valueKey] === props.modelValue);
        return option ? [option[props.labelKey]] : [];
    }
    if (!Array.isArray(props.modelValue)) return [];
    return props.options
        .filter(o => props.modelValue.includes(o[props.valueKey]))
        .map(o => o[props.labelKey]);
});

const selectedOptions = computed(() => {
    if (!props.multiple) {
        return props.options.filter(o => o[props.valueKey] === props.modelValue);
    }
    if (!Array.isArray(props.modelValue)) return [];
    return props.options.filter(o => props.modelValue.includes(o[props.valueKey]));
});

const filteredOptions = computed(() => {
    if (!searchQuery.value) return props.options;
    const q = searchQuery.value.toLowerCase();
    return props.options.filter(o => (o[props.labelKey] || '').toLowerCase().includes(q));
});

const unselectedOptions = computed(() => {
    const selectedIds = props.multiple
        ? (Array.isArray(props.modelValue) ? props.modelValue : [])
        : (props.modelValue ? [props.modelValue] : []);
    return filteredOptions.value.filter(o => !selectedIds.includes(o[props.valueKey]));
});

function selectOption(option) {
    const val = option[props.valueKey];
    if (props.multiple) {
        const arr = Array.isArray(props.modelValue) ? [...props.modelValue] : [];
        if (arr.includes(val)) {
            emit('update:modelValue', arr.filter(id => id !== val));
        } else {
            emit('update:modelValue', [...arr, val]);
        }
    } else {
        emit('update:modelValue', val);
        isOpen.value = false;
    }
    searchQuery.value = '';
}

function removeTag(val, event) {
    event.stopPropagation();
    if (props.multiple) {
        emit('update:modelValue', (Array.isArray(props.modelValue) ? props.modelValue : []).filter(id => id !== val));
    } else {
        emit('update:modelValue', props.multiple ? [] : '');
    }
}

function toggleDropdown() {
    isOpen.value = !isOpen.value;
    searchQuery.value = '';
}

function closeDropdown(e) {
    if (!dropdownRef.value?.contains(e.target) && !triggerRef.value?.contains(e.target)) {
        isOpen.value = false;
        searchQuery.value = '';
    }
}

onMounted(() => {
    document.addEventListener('click', closeDropdown);
});
onBeforeUnmount(() => {
    document.removeEventListener('click', closeDropdown);
});
</script>

<template>
    <div class="tag-select" ref="dropdownRef">
        <div class="tag-trigger" ref="triggerRef" @click.prevent="toggleDropdown">
            <span v-for="opt in selectedOptions" :key="opt[props.valueKey]" class="tag-chip">
                {{ opt[props.labelKey] }}
                <button type="button" class="tag-remove" @click.stop="removeTag(opt[props.valueKey], $event)">&times;</button>
            </span>
            <span v-if="selectedLabels.length === 0" class="tag-placeholder">{{ placeholder }}</span>
            <span class="tag-arrow">▼</span>
        </div>
        <div v-if="isOpen" class="tag-dropdown">
            <div class="tag-search">
                <input
                    type="text"
                    v-model="searchQuery"
                    class="form-control form-control-sm"
                    :placeholder="placeholder"
                    autocomplete="off"
                />
            </div>
            <div class="tag-options">
                <div
                    v-for="option in unselectedOptions"
                    :key="option[labelKey]"
                    class="tag-option"
                    @click.stop="selectOption(option)"
                >
                    {{ option[labelKey] }}
                </div>
                <div v-if="unselectedOptions.length === 0" class="tag-no-options">No options</div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.tag-select {
    position: relative;
    width: 100%;
}
.tag-trigger {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
    min-height: 38px;
    padding: 4px 28px 4px 8px;
    border: 1px solid #ced4da;
    border-radius: 0.25rem;
    background: #fff;
    cursor: pointer;
    position: relative;
}
.tag-trigger:hover {
    border-color: #80bfff;
}
.tag-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #007bff;
    color: #fff;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 13px;
    line-height: 1.4;
}
.tag-remove {
    background: none;
    border: none;
    color: #fff;
    font-size: 16px;
    line-height: 1;
    cursor: pointer;
    padding: 0;
    opacity: 0.8;
}
.tag-remove:hover {
    opacity: 1;
}
.tag-placeholder {
    color: #6c757d;
    font-size: 14px;
}
.tag-arrow {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 10px;
    color: #6c757d;
    pointer-events: none;
}
.tag-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 1050;
    margin-top: 2px;
    background: #fff;
    border: 1px solid #ced4da;
    border-radius: 0.25rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.12);
    max-height: 220px;
    display: flex;
    flex-direction: column;
}
.tag-search {
    padding: 6px 8px;
    border-bottom: 1px solid #e9ecef;
}
.tag-options {
    overflow-y: auto;
    padding: 4px 0;
    max-height: 170px;
}
.tag-option {
    padding: 8px 12px;
    cursor: pointer;
    font-size: 14px;
}
.tag-option:hover {
    background: #f1f5f9;
    color: #007bff;
}
.tag-no-options {
    padding: 12px;
    text-align: center;
    color: #6c757d;
    font-size: 13px;
}
</style>
