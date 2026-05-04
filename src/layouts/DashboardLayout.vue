<script setup>
import '../assets/css/backend-plugin.min.css';
import '../assets/css/backend.css';
import 'popper.js'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import Sidebar from '../components/Sidebar.vue';
import Topbar from '../components/Topbar.vue';
import Footer from '../components/Footer.vue';
import { computed, watch } from 'vue'
import { useUiStore } from '../stores/ui'

const ui = useUiStore()

watch(
    () => ui.sidebarOpen,
    (val) => document.body.classList.toggle('sidebar-main', val),
    { immediate: true }
)
</script>

<template>
    <div class="app-container">

        <!-- Sidebar -->
        <Sidebar />

        <div class="wrapper">

            <!-- Top Navbar -->
            <Topbar />

            <div class="content-page">
                <div class="container-fluid">
                    <router-view />
                </div>
            </div>

            <!-- Footer -->
            <Footer />

        </div>
    </div>
</template>
