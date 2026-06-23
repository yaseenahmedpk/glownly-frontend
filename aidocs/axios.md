# Axios Handling Guide

This document outlines the standards and patterns for handling API requests with Axios in the BarberWebApp-frontend project.

## Overview

The project uses a centralized Axios instance configured in `src/services/api.js` that handles authentication, base URLs, and response interceptors automatically.

## Create API Requests - Service File Standards

All API endpoints must be created in `src/services/*Service.js` files. **Never call axios directly from views.**

### Import

```javascript
import API from "./api";
```

### Endpoint Patterns

#### GET Requests

**Simple GET:**
```javascript
export const getProfile = () => API.get("/v1/user/profile");
```

**GET with query parameters:**
```javascript
export const getServices = (filter = {}) =>
  API.get("/v1/services", {
    params: filter,
  });
```

**GET with dynamic path parameter:**
```javascript
export const getStates = (countryId) => API.get(`/v1/states/${countryId}`);
```

#### POST Requests

**Simple POST:**
```javascript
export const login = (data) => API.post("/v1/user/login", data);
```

**POST with explicit response extraction (recommended for data needed immediately):**
```javascript
export const signup = async (data) => {
  const res = await API.post("/v1/user/register", data);
  return res.data;
};
```

#### PUT/PATCH Requests

```javascript
export const updateBranch = (id, data) => API.put(`/v1/branches/${id}`, data);
```

#### DELETE Requests

```javascript
export const deleteBranch = (id) => API.delete(`/v1/branches/${id}`);
```

### FormData and File Uploads

For file uploads, use FormData and handle both FormData and regular data cases:

```javascript
export const updateService = (id, data) => {
  if (data instanceof FormData) {
    data.append("_method", "PUT");
    return API.post(`/v1/services/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
  const formData = new FormData();
  formData.append("business_id", data.business_id);
  formData.append("service_category_id", data.service_category_id);
  formData.append("name", data.name);
  formData.append("duration_minutes", data.duration_minutes || "");
  formData.append("is_active", data.is_active || false);
  if (data.image) {
    formData.append("image", data.image);
  }
  formData.append("_method", "PUT");
  return API.post(`/v1/services/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
```

### POST with Query Parameters

```javascript
export const getNotifications = (filter = {}) =>
  API.get("/v1/all-notifications", {
    params: filter,
  });

export const markAsRead = (id, type) =>
  API.post(`/v1/notifications/${id}/read`, { type });
```

## Using Services in Views

```javascript
import { getDashboardStats } from "../../services/dashboardService";
import { handleApiError } from "../../helpers/handleApiError";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const fetchData = async () => {
  try {
    const response = await getDashboardStats(params);
    stats.value = response.data;
  } catch (err) {
    const errors = handleApiError(err, t);
    // handle errors
  }
};
```

## API Instance Configuration (`src/services/api.js`)

### Base Configuration

- **Base URL:** `import.meta.env.VITE_API_BASE_URL`
- **Request Interceptor:** Automatically attaches `Authorization: Bearer {token}` header from auth store

### Response Interceptor

Handles 401 errors (unauthorized) - currently empty placeholder for future auth handling.

## Error Handling (`src/helpers/handleApiError.js`)

Use the `handleApiError` helper to process API errors consistently:

```javascript
import { handleApiError } from "../../helpers/handleApiError";

try {
  const response = await someApiCall();
} catch (err) {
  const errors = handleApiError(err, t);
  // errors is an array of message strings
}
```

### Error Handling Logic

| Status | Response Structure | Result |
|--------|-------------------|--------|
| 422 | `{ errors: { field: ["message"] } }` | Returns array of validation error messages |
| >= 500 | Any | Returns server error message |
| >= 400 | `{ message: "error_key" }` | Returns the message from response |
| No response | Network error | Returns network error message |
| Other | - | Returns generic "something went wrong" message |

## Environment Variables

- `VITE_API_BASE_URL` - Base URL for all API endpoints
- `VITE_REVERB_APP_KEY` - WebSocket key for Laravel Echo (used separately)

## File Naming Convention

Service files follow the pattern: `{resource}Service.js`

Examples:
- `authService.js` - Authentication endpoints
- `serviceService.js` - Service management endpoints
- `branchService.js` - Branch management endpoints
- `dashboardService.js` - Dashboard statistics

## Summary Checklist for Adding New Endpoints

1. Create/edit the appropriate `{resource}Service.js` file in `src/services/`
2. Import `API` from `./api` (not `axios` directly)
3. Use the resource-based path structure: `/v1/{resource}` (e.g., `/v1/branches`)
4. For file uploads, use FormData with `_method` override and proper headers
5. Call the service from views, never call axios directly in views
6. Handle errors using `handleApiError` helper with the `t` (i18n) function