import { createApp, watch } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import { initEcho } from "./services/echo";
import { useAuthStore } from "./stores/authStore";
import i18n from "./i18n";
import { useLanguageStore } from "./stores/languageStore";
import $ from 'jquery'

window.$ = $
window.jQuery = $
const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(i18n);

const languageStore = useLanguageStore();
i18n.global.locale.value = languageStore.locale;

watch(
  () => languageStore.locale,
  (newLang) => {
    i18n.global.locale.value = newLang;
  },
);

// Initialize Echo with the initial auth token
const authStore = useAuthStore();
authStore.loadFromStorage();
if (authStore.token) {
  initEcho(authStore.token);
}

app.mount("#app");
