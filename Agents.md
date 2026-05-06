# Project Overview - Agents.md

This file serves as a summary of changes and updates made to the BarberWebApp-frontend project. It is updated with each modification to provide a quick overview of the project's evolution.

### Roles Edit and Delete Functionality (May 5, 2026)
- **Files Modified**: `src/views/dashboard/RolesView.vue`, `src/components/dashboard/Roles.vue`
- **Service Updated**: `src/services/roleService.js`
- **Changes**:
  - Added `updateRole(id, data)` and `deleteRole(id)` functions to the roles service.
  - Implemented edit and delete functionality in RolesView.vue:
    - Added `editingRoleId` ref and `modalTitle` ref for edit mode.
    - Imported Swal for confirmation dialogs.
    - Modified `saveRole` to call `updateRole` for edits or `storeRole` for new entries.
    - Added `handleRoleData` to populate modal for editing.
    - Added `handleDeleteRole` with confirmation prompt before deletion.
    - Added event listeners for `@roleData` and `@deleteRole`.
  - Updated Roles.vue component:
    - Added `roleData` and `deleteRole` emit events.
    - Added `selectRole` and `deleteRole` functions to emit events.
    - Added `@click` handlers to edit and delete icons.
  - Follows existing patterns: service calls, error handling, and user confirmation via SweetAlert2.
- **Validation**: Code compiles without errors; functionality mirrors permissions implementation.

### Role Permissions Save Functionality (May 6, 2026)
- **Files Modified**: `src/components/dashboard/RolePermissions.vue`, `src/views/dashboard/RolePermissionsView.vue`
- **Service Updated**: `src/services/roleService.js`
- **Changes**:
  - Added `storeRolePermissions(data)` service function for posting to `/store-roles-permissions`.
  - Implemented save flow in RolePermissions.vue:
    - Added `roleId` prop and `selectedPermissionIds` local state.
    - Synchronized selected checkboxes with permissions whose `status === 1`.
    - Added checkbox change handling to build `permissionIds`.
    - Added save button calling `storeRolePermissions({ roleId, permissionIds })`.
    - Added save loading state and error handling.
  - Updated RolePermissionsView.vue to pass `:roleId="id"` into the component.
- **Validation**: No lint/type errors in modified files.

### Permissions Table Filter Enable (May 6, 2026)
- **File Modified**: `src/components/dashboard/Permissions.vue`
- **Changes**:
  - Replaced standard HTML table with `vue3-easy-data-table` component.
  - Enabled global search/filter with `:search-field="true"` prop.
  - Added sortable columns for ID and Name.
  - Configured pagination, loading state, and Bootstrap styling.
  - Maintained existing action buttons (edit/delete) in template slots.
- **Validation**: No errors; table now supports filtering across all columns.

### Roles Table Filter Enable (May 6, 2026)
- **File Modified**: `src/components/dashboard/Roles.vue`
- **Changes**:
  - Replaced standard HTML table with `vue3-easy-data-table` component.
  - Enabled global search/filter with `:search-field="true"` prop.
  - Added sortable columns for ID and Name.
  - Configured pagination, loading state, and Bootstrap styling.
  - Maintained existing action buttons (edit/delete/view permissions) in template slots.
- **Validation**: No errors; table now supports filtering across all columns.
- **Files Modified**: `src/views/dashboard/PermissionsView.vue`, `src/components/dashboard/Permissions.vue`
- **Service Updated**: `src/services/permissoinsService.js`
- **Changes**:
  - Added `deletePermission(id)` function to the permissions service for deleting permissions.
  - Implemented delete functionality in PermissionsView.vue:
    - Imported Swal for confirmation dialogs.
    - Added `handleDeletePermission(id)` function with confirmation prompt before deletion.
    - Added `@deletePermission` event listener to Permissions component.
  - Updated Permissions.vue component:
    - Added `deletePermission` emit event.
    - Added `@click` handler to delete icon to emit delete event with permission ID.
  - Follows existing patterns: service calls, error handling, and user confirmation via SweetAlert2.
- **Validation**: Code compiles without errors; functionality includes confirmation dialog to prevent accidental deletions.

## Project Structure
- **Framework**: Vue.js with Vite
- **Styling**: Bootstrap
- **State Management**: Pinia
- **API**: Axios for HTTP requests
- **Internationalization**: Vue I18n
- **Real-time**: Laravel Echo with Pusher

## Key Components
- Authentication system with login, signup, password reset
- Dashboard layout with sidebar and topbar
- Permissions and roles management
- Multilingual support (English and Malay)

## Dependencies
- Vue 3
- Bootstrap 4
- Axios
- Pinia
- SweetAlert2
- Laravel Echo
- Pusher.js

This overview will be updated with future changes to maintain a clear record of project modifications.