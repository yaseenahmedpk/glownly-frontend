<script setup>
import { onMounted, ref, watch, computed } from 'vue'
import { useUiStore } from '../stores/ui'
import { RouterLink, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n'
import defaultLogo from '../assets/images/remaken_admin.png'
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
const isSettingsOpen = computed(() => ['Roles', 'Permissions', 'RolePermissions', 'Notifications', 'SystemNotifications', 'ServiceCategories'].includes(route.name))
const isBusinessSettingsOpen = computed(() => route.name === 'Businesses')
const isRolesActive = computed(() => route.name === 'Roles')
const isPermissionsActive = computed(() => route.name === 'Permissions')
const isNotificationsActive = computed(() => route.name === 'Notifications')
const isSystemNotificationsActive = computed(() => route.name === 'SystemNotifications')
const isServiceCategoriesActive = computed(() => route.name === 'ServiceCategories')
const isServicesActive = computed(() => route.name === 'Services')
const isBusinessesActive = computed(() => route.name === 'Businesses')
const isStaffActive = computed(() => route.name === 'Staff')
const isReportsOpen = computed(() => ['AttendanceReport', 'PayrollReport'].includes(route.name))
const isAttendanceActive = computed(() => route.name === 'AttendanceReport')
const isPayrollActive = computed(() => route.name === 'PayrollReport')

const companyLogo = computed(() => {
    return company.value?.business_logo_url ? company.value?.business_logo_url : defaultLogo
})
const companyName = computed(() => {
    return company.value?.name || company.value?.business_name || "Remaken"
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
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                    stroke-width="1.5" stroke="currentColor" class="size-6">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
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
                                <RouterLink to="/notifications"
                                    :class="['svg-icon', { active: isNotificationsActive }]">
                                    <i class="">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" fill="none"
                                            viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </i><span class="">{{ $t('notifications') }}</span>
                                </RouterLink>
                            </li>
                            <li :class="['sidebar-layout', { active: isSystemNotificationsActive }]"
                                v-if="hasPermission('can_access_notification')">
                                <RouterLink to="/system-notifications"
                                    :class="['svg-icon', { active: isSystemNotificationsActive }]">
                                    <i class="">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" fill="none"
                                            viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </i><span class="">{{ $t('system_notifications') }}</span>
                                </RouterLink>
                            </li>
                            <li :class="['sidebar-layout', { active: isServiceCategoriesActive }]"
                                v-if="hasPermission('can_access_service_category')">
                                <RouterLink to="/service-categories"
                                    :class="['svg-icon', { active: isServiceCategoriesActive }]">
                                    <i class="">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" fill="none"
                                            viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M7 7h.01M7 7a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2h-10a2 2 0 01-2-2V7z" />
                                        </svg>
                                    </i><span class="">{{ $t('service_categories') }}</span>
                                </RouterLink>
                            </li>
                            <li :class="['sidebar-layout', { active: isServicesActive }]"
                                v-if="hasPermission('can_access_service')">
                                <RouterLink to="/services" :class="['svg-icon', { active: isServicesActive }]">
                                    <i class="">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" fill="none"
                                            viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                        </svg>
                                    </i><span class="">{{ $t('services') }}</span>
                                </RouterLink>
                            </li>

                        </ul>
                    </li>
                    <li :class="['sidebar-layout', { active: isReportsOpen }]"
                        v-if="hasPermission('can_access_reports')">
                        <a href="#reports" :class="['svg-icon', { collapsed: !isReportsOpen }]" data-toggle="collapse"
                            :aria-expanded="isReportsOpen">
                            <i>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                    stroke-width="1.5" stroke="currentColor" class="size-6">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125v-2.25zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125v-8.25zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                                </svg>

                            </i>
                            <span class="ml-2">{{ $t('reports') }}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" class="svg-icon iq-arrow-right arrow-active"
                                width="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 5l7 7-7 7" />
                            </svg>
                        </a>
                        <ul id="reports" :class="['submenu', 'collapse', { show: isReportsOpen }]"
                            data-parent="#iq-sidebar-toggle">
                            <li :class="['sidebar-layout', { active: isAttendanceActive }]"
                                v-if="hasPermission('can_access_attendance_report')">
                                <RouterLink to="/attendance-report" :class="['svg-icon', { active: isAttendanceActive }]">
                                    <i class="">

                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" fill="none"
                                            viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                                                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                        </svg>

                                    </i><span class="">{{ $t('attendance') }}</span>
                                </RouterLink>

                            </li>
                            <li :class="['sidebar-layout', { active: isPayrollActive }]"
                                v-if="hasPermission('can_access_staff_payroll_report')">
                                <RouterLink to="/payroll-report" :class="['svg-icon', { active: isPayrollActive }]">
                                    <i class="">

                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" fill="none"
                                            viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                                                d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125S3.75 14.653 3.75 12.375" />
                                        </svg>

                                    </i><span class="">{{ $t('payroll') }}</span>
                                </RouterLink>

                            </li>
                        </ul>
                    </li>
                    <li :class="['sidebar-layout', { active: isBusinessSettingsOpen }]"
                        v-if="hasPermission('can_access_business')">
                        <a href="#business_settings" :class="['svg-icon', { collapsed: !isBusinessSettingsOpen }]"
                            data-toggle="collapse" :aria-expanded="isBusinessSettingsOpen">
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
                        <ul id="business_settings" :class="['submenu', 'collapse', { show: isBusinessSettingsOpen }]"
                            data-parent="#iq-sidebar-toggle">
                            <li :class="['sidebar-layout', { active: isBusinessesActive }]"
                                v-if="hasPermission('can_access_business')">
                                <RouterLink to="/businesses" :class="['svg-icon', { active: isBusinessesActive }]">
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
                    <li class="sidebar-layout" v-if="hasPermission('can_access_employees')">
                        <a href="#app1" class="collapsed svg-icon" data-toggle="collapse" aria-expanded="false">
                            <i>
                                <svg class="svg-icon" id="iq-user-1-1" xmlns="http://www.w3.org/2000/svg" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </i>
                            <span class="ml-2">{{ $t('human_resource') }}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" class="svg-icon iq-arrow-right arrow-active"
                                width="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 5l7 7-7 7" />
                            </svg>
                        </a>
                        <ul id="app1" class="submenu collapse" data-parent="#iq-sidebar-toggle">
                            <li :class="['sidebar-layout', { active: isStaffActive }]">
                                <RouterLink to="/staff" :class="['svg-icon', { active: isStaffActive }]">
                                    <i class="">

                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" fill="none"
                                            viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                                        </svg>

                                    </i><span class="">{{ $t('staff') }}</span>
                                </RouterLink>
                            </li>
                        </ul>
                    </li>

                </ul>
            </nav>
            <div class="pt-5 pb-5"></div>
        </div>
    </div>
</template>