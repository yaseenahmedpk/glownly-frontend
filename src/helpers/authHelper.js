import { useAuthStore } from "../stores/authStore";
export const hasRole = (roleName) => {
  const authStore = useAuthStore();
  if (!authStore.user || !authStore.user.roles) {
    return false;
  }
  return authStore.user.roles.some(
    (role) => role.name.toLowerCase() === roleName.toLowerCase(),
  );
};
export const hasAnyRole = (roles = []) => {
  const authStore = useAuthStore();

  return authStore.user?.roles?.some((role) => roles.includes(role.name));
};
export const hasPermission = (permissionName) => {
  const authStore = useAuthStore();
  return authStore.allPermissions?.includes(permissionName);
};

export const hasRoleId = (roleId) => {
  const authStore = useAuthStore();
  const id = Number(roleId);
  return authStore.user?.roles?.some((role) => Number(role.id) === id);
};

export const hasAnyPermission = (permissions = []) => {
  const authStore = useAuthStore();

  return permissions.some((permission) =>
    authStore.allPermissions?.includes(permission),
  );
};
