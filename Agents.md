# Project Overview - Agents.md

This file serves as a summary of changes and updates made to the BarberWebApp-frontend project. It is updated with each modification to provide a quick overview of the project's evolution.

## Recent Changes

### Permissions Delete Functionality (May 5, 2026)
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