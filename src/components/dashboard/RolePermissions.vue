<script setup>
import { ref, watch } from "vue";
import { RouterLink } from "vue-router";
const props = defineProps({
    rolePermissions: {
        type: Array,
        default: () => [],
    },
    loading: Boolean,
    saving: Boolean,
});

const emit = defineEmits(["savePermissions"]);
const selectedPermissionIds = ref([]);

watch(
    () => props.rolePermissions,
    (newPermissions) => {
        selectedPermissionIds.value = newPermissions
            .filter((permission) => permission.status === 1)
            .map((permission) => permission.id);
    },
    { immediate: true }
);

const togglePermission = (permissionId, checked) => {
    const id = Number(permissionId);
    if (checked) {
        if (!selectedPermissionIds.value.includes(id)) {
            selectedPermissionIds.value.push(id);
        }
    } else {
        selectedPermissionIds.value = selectedPermissionIds.value.filter(
            (item) => item !== id
        );
    }
};

const saveRolePermissions = () => {
    emit("savePermissions", selectedPermissionIds.value);
};
</script>
<template>
    <div class="col-sm-12 col-lg-12 mb-3 d-flex justify-content-end">
        <RouterLink to="/roles" class="btn btn-primary mr-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
            </svg>
            Back
        </RouterLink>
        <button class="btn btn-primary" :disabled="loading || props.saving" @click="saveRolePermissions">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="16" fill="currentColor" class="bi bi-floppy"
                viewBox="0 0 16 16">
                <path d="M11 2H9v3h2z" />
                <path
                    d="M1.5 0h11.586a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 14.5v-13A1.5 1.5 0 0 1 1.5 0M1 1.5v13a.5.5 0 0 0 .5.5H2v-4.5A1.5 1.5 0 0 1 3.5 9h9a1.5 1.5 0 0 1 1.5 1.5V15h.5a.5.5 0 0 0 .5-.5V2.914a.5.5 0 0 0-.146-.353l-1.415-1.415A.5.5 0 0 0 13.086 1H13v4.5A1.5 1.5 0 0 1 11.5 7h-7A1.5 1.5 0 0 1 3 5.5V1H1.5a.5.5 0 0 0-.5.5m3 4a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5V1H4zM3 15h10v-4.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5z" />
            </svg>
            {{ props.saving ? 'Saving...' : 'Save' }}
        </button>

    </div>
    <div v-for="rolePermission in props.rolePermissions" :key="rolePermission.id"
        class="col-md-4 col-lg-4 col-sm-4 mb-3">
        <div class="custom-control custom-checkbox custom-control-inline">
            <input type="checkbox" class="custom-control-input" :id="`permission_` + rolePermission.id"
                :checked="selectedPermissionIds.includes(rolePermission.id)"
                @change="(event) => togglePermission(rolePermission.id, event.target.checked)">
            <label class="custom-control-label" :for="`permission_` + rolePermission.id">
                {{ rolePermission.name }}
            </label>
        </div>
    </div>
</template>