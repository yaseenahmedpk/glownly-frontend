<script setup>
import { onMounted, ref, watch, computed } from 'vue'
import { useUiStore } from '../stores/ui'
import { RouterLink, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n'
import defaultLogo from '../assets/images/glownly_admin.png'
import { useAuthStore } from '../stores/authStore'
import { storeToRefs } from 'pinia'
import { hasPermission } from '../helpers/authHelper';

const ui = useUiStore()
const { t } = useI18n()
const authStore = useAuthStore()
const { company } = storeToRefs(authStore)
const route = useRoute()
const isDashboardActive = computed(() => route.name === 'DashboardHome' || route.path === '/dashboard')
const isBranchesActive = computed(() => route.name === 'Branches')
const isSettingsOpen = computed(() => ['Roles', 'Permissions', 'RolePermissions', 'Notifications', 'SystemNotifications'].includes(route.name))
const isRolesActive = computed(() => route.name === 'Roles')
const isPermissionsActive = computed(() => route.name === 'Permissions')
const isNotificationsActive = computed(() => route.name === 'Notifications')
const isSystemNotificationsActive = computed(() => route.name === 'SystemNotifications')

const companyLogo = computed(() => {
    return company.value?.business_logo_url ? company.value?.business_logo_url : defaultLogo
})
const companyName = computed(() => {
    return company.value?.name ? company.value?.name : "glownly"
})
</script>
<template>
    <div class="iq-sidebar  sidebar-default  ">
        <div class="iq-sidebar-logo d-flex align-items-end justify-content-between">
            <a href="../backend/index.html" class="header-logo">
                <img :src="companyLogo" class="img-fluid rounded-normal light-logo" alt="logo">
                <span>{{ companyName }}</span>
            </a>
            <div class="side-menu-bt-sidebar-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="text-light wrapper-menu"
                    :class="{ open: ui.sidebarOpen }" @click="ui.closeSidebar()" width="30" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </div>
        </div>
        <div class="data-scrollbar" data-scroll="1">
            <nav class="iq-sidebar-menu">
                <ul id="iq-sidebar-toggle" class="side-menu">
                    <li :class="['sidebar-layout', { active: isDashboardActive }]"
                        v-if="hasPermission('can_access_owner_dashboard')">
                        <RouterLink to="/dashboard" :class="['svg-icon', { active: isDashboardActive }]">
                            <i class="">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            </i>
                            <span class="ml-2">{{ $t('dashboard') }}</span>
                        </RouterLink>

                    </li>
                    <li :class="['sidebar-layout', { active: isBranchesActive }]"
                        v-if="hasPermission('can_access_owner_dashboard')">
                        <RouterLink to="/branches" :class="['svg-icon', { active: isBranchesActive }]">
                            <i class="">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" fill="none" viewBox="0 0 24 24"
                                    stroke-width="1.5" stroke="currentColor" class="size-6">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
                                </svg>

                            </i>
                            <span class="ml-2">{{ $t('branches') }}</span>
                        </RouterLink>

                    </li>
                    <li :class="['sidebar-layout', { active: isSettingsOpen }]"
                        v-if="hasPermission('can_access_settings_nav')">
                        <a href="#settings" :class="['svg-icon', { collapsed: !isSettingsOpen }]" data-toggle="collapse"
                            :aria-expanded="isSettingsOpen">
                            <i>
                                <svg class="svg-icon" id="iq-user-1-1" xmlns="http://www.w3.org/2000/svg" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </i>
                            <span class="ml-2">{{ $t('settings') }}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" class="svg-icon iq-arrow-right arrow-active"
                                width="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 5l7 7-7 7" />
                            </svg>
                        </a>
                        <ul id="settings" :class="['submenu', 'collapse', { show: isSettingsOpen }]"
                            data-parent="#iq-sidebar-toggle">
                            <li :class="['sidebar-layout', { active: isRolesActive }]"
                                v-if="hasPermission('can_access_role_navigation')">
                                <RouterLink to="/roles" :class="['svg-icon', { active: isRolesActive }]">
                                    <i class="">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" fill="none"
                                            viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </i><span class="">{{ $t('roles') }}</span>
                                </RouterLink>

                            </li>
                             <li :class="['sidebar-layout', { active: isPermissionsActive }]"
                                 v-if="hasPermission('can_access_permissions_navigation')">
                                 <RouterLink to="/permissions" :class="['svg-icon', { active: isPermissionsActive }]">
                                     <i class="">
                                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                             stroke-width="1.5" stroke="currentColor" class="size-6">
                                             <path stroke-linecap="round" stroke-linejoin="round"
                                                 d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
                                         </svg>

                                     </i><span class="">{{ $t('permissions') }}</span>
                                 </RouterLink>

                             </li>
                             <li :class="['sidebar-layout', { active: isNotificationsActive }]"
                                 v-if="hasPermission('can_access_notification')">
                                 <RouterLink to="/notifications" :class="['svg-icon', { active: isNotificationsActive }]">
                                     <i class="">
                                         <svg xmlns="http://www.w3.org/2000/svg" width="18" fill="none"
                                             viewBox="0 0 24 24" stroke="currentColor">
                                             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                 d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                         </svg>
                                     </i><span class="">{{ $t('notifications') }}</span>
                                 </RouterLink>
                             </li>

                        </ul>
                    </li>
                    <li :class="['sidebar-layout', { active: isSettingsOpen }]"
                        v-if="hasPermission('can_access_settings_nav')">
                        <a href="#business_settings" :class="['svg-icon', { collapsed: !isSettingsOpen }]"
                            data-toggle="collapse" :aria-expanded="isSettingsOpen">
                            <i>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                    stroke-width="1.5" stroke="currentColor" class="size-6">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
                                </svg>

                            </i>
                            <span class="ml-2">{{ $t('business_settings') }}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" class="svg-icon iq-arrow-right arrow-active"
                                width="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 5l7 7-7 7" />
                            </svg>
                        </a>
                        <ul id="business_settings" :class="['submenu', 'collapse', { show: isSettingsOpen }]"
                            data-parent="#iq-sidebar-toggle">
                            <li :class="['sidebar-layout', { active: isRolesActive }]"
                                v-if="hasPermission('can_access_role_navigation')">
                                <RouterLink to="/roles" :class="['svg-icon', { active: isRolesActive }]">
                                    <i class="">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                            stroke-width="1.5" stroke="currentColor" class="size-6">
                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
                                        </svg>

                                    </i><span class="">{{ $t('business_list') }}</span>
                                </RouterLink>

                            </li>
                        </ul>
                    </li>
                    <li class="sidebar-layout" v-if="hasPermission('can_access_hr_navigation')">
                        <a href="#app1" class="collapsed svg-icon" data-toggle="collapse" aria-expanded="false">
                            <i>
                                <svg class="svg-icon" id="iq-user-1-1" xmlns="http://www.w3.org/2000/svg" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </i>
                            <span class="ml-2">Human Resource (HR)</span>
                            <svg xmlns="http://www.w3.org/2000/svg" class="svg-icon iq-arrow-right arrow-active"
                                width="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 5l7 7-7 7" />
                            </svg>
                        </a>
                        <ul id="app1" class="submenu collapse" data-parent="#iq-sidebar-toggle">
                            <li class=" sidebar-layout">
                                <a href="../backend/auth-login.html" class="svg-icon">
                                    <i class="">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" fill="none"
                                            viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                                        </svg>
                                    </i><span class="">Employees</span>
                                </a>
                            </li>
                            <li class=" sidebar-layout">
                                <a href="../backend/auth-sign-up.html" class="svg-icon">
                                    <i class="">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" fill="none"
                                            viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                        </svg>
                                    </i><span class="">Register</span>
                                </a>
                            </li>
                            <li class=" sidebar-layout">
                                <a href="../backend/auth-recover-pwd.html" class="svg-icon">
                                    <i class="">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" fill="none"
                                            viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </i><span class="">Reset Password</span>
                                </a>
                            </li>
                            <li class=" sidebar-layout">
                                <a href="../backend/auth-confirm-mail.html" class="svg-icon">
                                    <i class="">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" fill="none"
                                            viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </i><span class="">Confirm Mail</span>
                                </a>
                            </li>
                            <li class=" sidebar-layout">
                                <a href="../backend/auth-lock-screen.html" class="svg-icon">
                                    <i class="">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" fill="none"
                                            viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </i><span class="">Lock Screen</span>
                                </a>
                            </li>
                        </ul>
                    </li>

                </ul>
            </nav>
            <div class="pt-5 pb-5"></div>
        </div>
    </div>
</template>