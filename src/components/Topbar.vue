<script setup>
import languageChangerIcon from '../assets/images/flag-lang.png'
import malFlag from '../assets/images/mal-flag.png'
import usaFlag from '../assets/images/usaFlag.png'
import defaultProfilePic from '../assets/images/profile.png'
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUiStore } from '../stores/ui'
import { useLanguageStore } from '../stores/languageStore'
import { useAuthStore } from '../stores/authStore'
import { storeToRefs } from 'pinia'
import { getEcho } from '../services/echo';
import { getNotifications } from '../services/notificationService';

const languageStore = useLanguageStore()
const { locale } = storeToRefs(languageStore)
const ui = useUiStore()
const authStore = useAuthStore()
const { user } = storeToRefs(authStore)
const router = useRouter()

const topbarRef = ref(null)
const profilePic = computed(() => {
    return user.value?.profile_pic ? user.value.profile_pic : defaultProfilePic
})

const showNotifications = ref(false)
const showLanguage = ref(false)
const showProfile = ref(false)
const notifications = ref([]) // To store notifications

const toggleNotifications = () => {
    showNotifications.value = !showNotifications.value
    showLanguage.value = false
    showProfile.value = false
}

const toggleLanguage = () => {
    showLanguage.value = !showLanguage.value
    showNotifications.value = false
    showProfile.value = false
}

const toggleProfile = () => {
    showProfile.value = !showProfile.value
    showNotifications.value = false
    showLanguage.value = false
}

const closeAllDropdowns = () => {
    showNotifications.value = false
    showLanguage.value = false
    showProfile.value = false
}

const handleClickOutside = (event) => {
    if (topbarRef.value && !topbarRef.value.contains(event.target)) {
        closeAllDropdowns()
    }
}

onMounted(() => {
    document.addEventListener('mousedown', handleClickOutside)
    
    // Fetch initial notifications
    fetchInitialNotifications();
    
    // Subscribe to system_all private channel for real-time notifications
    const echo = getEcho();
    if (echo && user.value) {
        const channel = echo.private('system_all');
        channel.listen('.system.notification', (notification) => {
            console.log('Received notification:', user.value);
            // Append new notification to the beginning of the array
            notifications.value.unshift(notification);
        });
    }
});

onUnmounted(() => {
    document.removeEventListener('mousedown', handleClickOutside)
})

const changeLang = (language) => {
    languageStore.setLanguage(language)
    showLanguage.value = false // close after selection
}
const handleLogout = async () => {
    await authStore.logout();
};

// Fetch initial notifications from API
const fetchInitialNotifications = async () => {
    try {
        const response = await getNotifications();
        notifications.value = response.data.notifications || [];
    } catch (error) {
        console.error('Failed to fetch initial notifications:', error);
        // Initialize with empty array if fetch fails
        notifications.value = [];
    }
};
</script>

<template>
    <div ref="topbarRef" class="iq-top-navbar">
        <div class="iq-navbar-custom">
            <nav class="navbar navbar-expand-lg navbar-light p-0">
                <div class="side-menu-bt-sidebar">
                    <svg xmlns="http://www.w3.org/2000/svg" class="text-secondary wrapper-menu"
                        @click="ui.toggleSidebar()" width="30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </div>
                <div class="d-flex align-items-center">

                    <button class="navbar-toggler" type="button" data-toggle="collapse"
                        data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                        aria-label="Toggle navigation">
                        <svg xmlns="http://www.w3.org/2000/svg" class="text-secondary" width="30" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul class="navbar-nav ml-auto navbar-list align-items-center">
                            <li class="nav-item nav-icon dropdown">
                                <a href="#" class="search-toggle dropdown-toggle" id="notification-dropdown"
                                    @click.prevent="toggleNotifications" aria-haspopup="true"
                                    :aria-expanded="showNotifications">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25"
                                        class="h-6 w-6 text-secondary" fill="none" viewBox="0 0 24 24"
                                        stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                    <span class="bg-primary"></span>
                                </a>
                                <div class="iq-sub-dropdown dropdown-menu" :class="{ show: showNotifications }"
                                    @click.stop aria-labelledby="notification-dropdown">
                                    <div class="card shadow-none m-0 border-0">
                                        <div class="p-3 card-header-border">
                                            <h6 class="text-center">
                                                Notifications
                                            </h6>
                                        </div>
                                         <div class="card-body overflow-auto card-header-border p-0 card-body-list"
                                             style="max-height: 500px;">
                                             <ul class="dropdown-menu-1 overflow-auto list-style-1 mb-0">
                                                 <li v-for="notification in notifications" :key="notification.id" class="dropdown-item-1 float-none p-3">
                                                     <div class="list-item d-flex justify-content-start align-items-start">
                                                         <div class="avatar">
                                                             <div class="avatar-img avatar-info avatar-20">
                                                                 <span>
                                                                     <svg class="icon line" width="30" height="30"
                                                                         id="notification-icon" stroke="white"
                                                                         xmlns="http://www.w3.org/2000/svg"
                                                                         viewBox="0 0 24 24">
                                                                         <path
                                                                             d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                                                                             style="fill:none;stroke-linecap:round;stroke-linejoin:round;stroke-width:2"/>
                                                                         </svg>
                                                                 </span>
                                                             </div>
                                                         </div>
                                                         <div class="list-style-detail ml-2 mr-2">
                                                             <h6 class="font-weight-bold">{{ notification.title }}</h6>
                                                             <p class="m-0">
                                                                 <small class="text-secondary">{{ notification.message }}</small>
                                                             </p>
                                                             <p class="m-0">
                                                                 <small class="text-secondary">
                                                                     <svg xmlns="http://www.w3.org/2000/svg"
                                                                         class="text-secondary mr-1" width="15"
                                                                         fill="none" viewBox="0 0 24 24"
                                                                         stroke="currentColor">
                                                                         <path stroke-linecap="round"
                                                                             stroke-linejoin="round" stroke-width="2"
                                                                             d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                         </svg>
                                                                     {{ notification.created_at || 'Just now' }}</small>
                                                             </p>
                                                         </div>
                                                     </div>
                                                 </li>
                                                 <li v-if="notifications.length === 0" class="dropdown-item-1 float-none p-3 text-center">
                                                     <span class="text-muted">No notifications</span>
                                                 </li>
                                             </ul>
                                        </div>
                                        <div class="card-footer text-muted p-3">
                                            <p class="mb-0 text-primary text-center font-weight-bold">Show all
                                                notifications</p>
                                        </div>
                                    </div>
                                </div>
                            </li>
                            <li class="nav-item nav-icon dropdown">
                                <a href="#" class="search-toggle dropdown-toggle" id="dropdownMenuButton2"
                                    @click.prevent="toggleLanguage" aria-haspopup="true" :aria-expanded="showLanguage">
                                    <img :src="languageChangerIcon" class="img-fluid rounded-circle" alt="user"
                                        style="height: 30px; min-width: 30px; width: 30px;">
                                    <span class="bg-primary"></span>
                                </a>
                                <div class="iq-sub-dropdown dropdown-menu" :class="{ show: showLanguage }" @click.stop
                                    aria-labelledby="dropdownMenuButton2">
                                    <div class="card shadow-none m-0 border-0">
                                        <div class=" p-0 ">
                                            <ul class="dropdown-menu-1 list-group list-group-flush">
                                                <li class="dropdown-item-1 list-group-item  px-2"
                                                    @click="changeLang('en')">
                                                    <a class="p-0 d-flex align-items-center justify-content-between"
                                                        href="#">
                                                        <span>
                                                            <img :src="usaFlag" alt="img-flaf" class="img-fluid mr-2"
                                                                style="width: 20px;height: 15px;min-width: 20px;" />English
                                                        </span>
                                                        <span v-if="locale === 'en'"
                                                            class="text-success font-weight-bold">✓</span>
                                                    </a>
                                                </li>
                                                <li class="dropdown-item-1 list-group-item  px-2"
                                                    @click="changeLang('ms')">
                                                    <a class="p-0 d-flex align-items-center justify-content-between"
                                                        href="#">
                                                        <span>
                                                            <img :src="malFlag" alt="img-flaf" class="img-fluid mr-2"
                                                                style="width:20px;height: 15px;min-width: 20px;" />Bahasa
                                                            Melayu
                                                        </span>
                                                        <span v-if="locale === 'ms'"
                                                            class="text-success font-weight-bold">✓</span>
                                                    </a>
                                                </li>

                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </li>

                            <li class="nav-item nav-icon dropdown">
                                <a href="#" class="nav-item nav-icon dropdown-toggle pr-0 search-toggle"
                                    id="dropdownMenuButton" @click.prevent="toggleProfile" aria-haspopup="true"
                                    :aria-expanded="showProfile">
                                    <img :src="profilePic" class="img-fluid avatar-rounded" alt="user">
                                    <span class="mb-0 ml-2 user-name">{{ user?.full_name }}</span>
                                </a>
                                <ul class="dropdown-menu dropdown-menu-right" :class="{ show: showProfile }" @click.stop
                                    aria-labelledby="dropdownMenuButton">
                                    <li class="dropdown-item d-flex svg-icon">
                                        <svg class="svg-icon mr-0 text-secondary" id="h-01-p" width="20"
                                            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                            stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <RouterLink to="/profile">{{ $t('my_profile') }}</RouterLink>
                                    </li>
                                  
                                    <li class="dropdown-item d-flex svg-icon">
                                        <svg class="svg-icon mr-0 text-secondary" id="h-03-p" width="20"
                                            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                            stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <a href="../app/user-account-setting.html">Account Settings</a>
                                    </li>
                                    <li class="dropdown-item d-flex svg-icon">
                                        <svg class="svg-icon mr-0 text-secondary" id="h-04-p" width="20"
                                            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                            stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                        <a href="../app/user-privacy-setting.html">Privacy Settings</a>
                                    </li>
                                    <li class="dropdown-item d-flex svg-icon border-top" @click="handleLogout">
                                        <svg class="svg-icon mr-0 text-secondary" width="20"
                                            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                            stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>

                                        <span>Logout</span>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </div>
    </div>
</template>
