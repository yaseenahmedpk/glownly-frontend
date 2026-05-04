<script setup>
defineProps({
    permissions: {
        type: Array,
        default: () => [],
    },
});
</script>
<template>
    <div>
        <table class="table table-bordered">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Role</th>
                </tr>
            </thead>

            <tbody>
                <tr v-for="permission in permissions" :key="permission.id">
                    <td>{{ permission.id }}</td>
                    <td>{{ permission.name }}</td>
                    <td>{{ permission.roles.name }}</td>
                </tr>

                <tr v-if="permissions.length === 0">
                    <td colspan="3" class="text-center">No data found</td>
                </tr>
            </tbody>
        </table>
    </div>

</template>